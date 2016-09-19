#!/bin/bash

sudo ifconfig eth2 up
sudo ifconfig eth2 0
sudo cp batman-adv-2016.1/net/batman-adv/batman-adv.ko /lib/modules/`uname -r`/kernel/net/batman-adv/
sudo modprobe batman-adv
sudo ./batctl-2016.1/batctl if add eth2
sudo ifconfig bat0 up
sudo ifconfig bat0 inet 192.168.100.4 netmask 255.255.255.0



