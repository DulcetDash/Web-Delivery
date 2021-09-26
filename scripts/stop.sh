#!/bin/bash

(cd /home/ubuntu/Delivery ; sudo docker-compose down)
sudo docker system prune --all --force