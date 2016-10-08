# NexFi web-admin Documentation

## Installation

1. Compile src/main.go into binary file.

```bash
$ git clone git@github.com:pylemon/NexFi.git
$ cd NexFi
$ mips-openwrt-linux-gccgo src/main.go -o server -static-libgo
```

Command `mips-openwrt-linux-gccgo` is from package `OpenWrt-Toolchain-ar71xx-generic_gcc-5.3.0_glibc-2.19.Linux-x86_64/bin`

2. copy binary file and static files into NexFi terminals.

```bash
$ ssh root@192.168.100.61
root@OpenWrt:~# mkdir web-admin
root@OpenWrt:~# cd web-admin
root@OpenWrt:~/web-admin# mkdir gobdb
root@OpenWrt:~/web-admin# exit

$ cd NexFi
$ tar cvf template.tar template/
$ scp config.json ip_info.json template.tar root@192.168.100.61:~/web-admin/
$ ssh root@192.168.100.61
root@OpenWrt:~# cd web-admin
root@OpenWrt:~/web-admin# tar xvf template.tar
root@OpenWrt:~/web-admin# ./server >/dev/null 2>&1 & 
```

# Configuration
You may modify `config.json` and `ip_info.json` files on your needs.

* config.json

    contains basic config for web-admin interface. includes login users vis-command to use etc.
 
* ip_info.json

    This file is the basic network config of the whole network.
