`use strict`;

const dotenv = require('dotenv').config({
  path: '../.env'
});

const cLogger = require('../log');
const logger = cLogger.createChildLogger({
  module: 'pgbackup.js'
})


const config = require('./pgbackup.json');
var db = require('../db');
const PQ = require('pg-promise').ParameterizedQuery;

var fs = require('fs');

class PgBackup {
  constructor(path) {
    this.path = path;
    PgBackup.pgMade++;
    this.curPath = path;
    this.curDepth = 0;
  }

  static get pgMade() {
    return !this._count ? 0 : this._count;
  }

  static set pgMade(val) {
    this._count = val;
  }

  run_backup(config) {
    for (var prop in config) {
      logger.info(`Process object ${prop} ${this.path}`);
      //   this.curDepth = 1;
      //   this.curPath = `${this.path}/${prop}`;
      this.prc_node(config, this.path, 1)
    }
  }

  async prc_node(node, pPath, pDepth) {

    if (node.hasOwnProperty('type')) {
      logger.info(`Process type is ${node.type}`);
      PgBackup.pgMade++;
      switch (node.type) {
        case 'sql_row2file':
          this.sqlRow2file(node, pPath, pDepth);
          break;
        case 'sql_content':
          node.data.forEach(el =>this.sqlContent(el, pPath, pDepth));
          break;

        default:
          logger.error(`!!! Unknow type ${node.type}`);
          PgBackup.pgMade--;
          break;
      }

    } else {
      for (var prop in node) {
        let vPath = pPath + `/${prop}`,
          vDepth = pDepth++;
        logger.info(`Hierarchy  process depth ${'-'.repeat(vDepth)}> ${vPath}`);
        this.create_folder(vPath);
        if (vDepth > 10) {
          logger.Error('Depth of config file > 10 nodes !!!');
        } else {
          this.prc_node(node[prop], vPath, vDepth)
        }
      }

    }
  }

  create_folder(path) {
    logger.info(` -> Create folder ${path}`);
    fs.existsSync(path) || fs.mkdirSync(path)
  }

  async sqlRow2file(node, pPath, pDepth) {
    const fSql = new PQ({text: node.sql, rowMode: 'array'});
    let d = await db.db.result(fSql);
    d.rows.forEach(el => {
      this.writeFile(pPath+"/"+el[0],el[1]) 
      logger.info(` sqlRow2file ${'-'.repeat(pDepth)}> Saved  ${pPath}/${el[0]} ,${el[1].length} chars`);
    });
    
  }

  async sqlContent(node, pPath, pDepth) {
    const fSql = new PQ({text: node.sql, rowMode: 'array'});
    let d = await db.db.result(fSql);
    const json = JSON.stringify({ rows: d.rows, fileds: d.fields}, null, 2)
    this.writeFile(pPath+"/"+node.filename,json) 
    logger.debug(` sql_content ${'-'.repeat(pDepth)}> Saved  ${pPath}/${node.filename} ,${json.length} chars`);
    
  }

  writeFile(filename,content) {
    // logger.debug(`  -= write file ${filename}`);
    fs.writeFile(filename, content, 'utf8', (err) => {
      if (err) throw err;
      // logger.debug(`  ->File ${filename} has been saved!`);
    });
  }
}



/** Stat main code */

logger.info(`--- Start Backup ${JSON.stringify(Object.keys(config))}`);

const pgBackup = new PgBackup('./pgbackup');

pgBackup.run_backup(config);

logger.info(`=== Stop Backup count backup objects ${PgBackup.pgMade}`);
