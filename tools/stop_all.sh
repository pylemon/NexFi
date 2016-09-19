#!/bin/bash

ps aux | grep alfred-2016.1 | grep -v grep | awk '{print $2}' | xargs kill -9
rmmod batman-adv