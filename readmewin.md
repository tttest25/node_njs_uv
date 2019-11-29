# Windows 


## Docker 
attach to container and clear logs 
#https://blog.jongallant.com/2017/11/delete-docker-container-log-files/
#https://blog.jongallant.com/2017/11/ssh-into-docker-vm-windows/
docker run --privileged -it -v /var/run/docker.sock:/var/run/docker.sock jongallant/ubuntu-docker-client 
docker run --net=host --ipc=host --uts=host --pid=host -it --security-opt=seccomp=unconfined --privileged --rm -v /:/host alpine /bin/sh
chroot /host
# after connect clear
find /var/lib/docker/containers/ -type f -name "*.log" -delete