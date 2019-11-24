# Резервное копирование и версионность pg - объектов
  Скрипт сохраняет объекты PostgreSQL заданные в json  в структуры файлов в пригодном для версионирования виде.

    Пример конфигурации
    {
    "uvdata": {
        "functions": {
            "sql": " WITH funcs AS ( SELECT n.nspname||'_'||proname||'.sql' AS sproc_name ,pg_get_functiondef(p.oid) as definition , proargnames AS arg_names ,t.typname AS return_type ,d.description FROM pg_proc p left JOIN pg_type t on p.prorettype = t.oid left JOIN pg_description d on p.oid = d.objoid JOIN pg_namespace n on n.oid = p.pronamespace WHERE n.nspname = 'uvdata' ) SELECT * FROM funcs",
            "type":"sql_row2file"
        },
        "tables": {
            "content":{
                "data":[
                    {"sql":"SELECT * FROM uvdata.uv_data_steps","filename":"uvdata__uv_data_steps.json"}
                ],
                "type":"sql_content"
            },
            "ddl":{
                "sql": "select schemaname||'_'||tablename||'.sql' as flname ,get_ddl_t(schemaname,tablename,'{\"handle exceptions\":true}') as ddl from pg_tables where schemaname='uvdata';",
                "type":"sql_row2file"
            }
        }        
    },


## Запуск


    $/app/pgbackup# node --async-stack-traces --harmony-await-optimization  --inspect=0.0.0.0:9229 ./pgbackup.js  | pino-pretty -t