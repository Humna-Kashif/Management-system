#!/bin/bash

#-------------------------------------------------------------------------------
# Script for initializing server for Aibers Health Development
#-------------------------------------------------------------------------------

PATH=/usr/bin:/bin

AIBERS=/home/aibers/aibers_web
IP=$(/usr/sbin/ifconfig | /usr/bin/sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p')

LOG=/tmp/initialize_software.txt

function postgres() {

    echo 'Installing PostgreSQL...'
    apt install -y postgresql postgresql-contrib -y >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    echo 'PostgreSQL installed'
    echo
}

function node() {

    echo 'Installing Node.js...'
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    apt install -y nodejs >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    echo 'Node.js installed'
    
    echo 'Installing node modules and building...'
    cd $AIBERS/api
    echo 'Installing API...'
    npm install >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    cd $AIBERS/frontend
    echo 'Installing Frontend...'
    npm install >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    echo 'Rebuilding sass...'
    npm rebuild node-sass >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    npm run build >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    echo 'Node modules installed'

    echo 'Installing PM2...'
    npm install pm2 -g >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    
    echo 'Starting Node.js server with pm2...'

    echo 'Deleting previous pm2 processes...'
    pm2 delete all >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi

    echo 'Starting app.js with pm2...'
    pm2 start -u aibers $AIBERS/api/src/app.js --name node_server >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi

    echo 'Configuring pm2 processes to auto-start on reboot...'
    env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u aibers --hp /home/aibers >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi

    echo 'Saving pm2 processes...'
    pm2 save -u aibers >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi

    echo 'Node.js server started with pm2'

    /usr/bin/echo

}

function nginx() {
    echo 'Installing NGINX...'
    apt install nginx -y >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    systemctl enable nginx >>$LOG 2>&1
    if [ $? != 0 ]; then
        echo "Command failed"
        exit
    fi
    echo 'NGINX installed'

    echo 'Checking if NGINX is configured...'
    find /etc/nginx/sites-available/app.aibers.health >>$LOG 2>&1

    if [ "$?" != 0 ]; then
        echo 'NGINX not configured...'
        echo 'Configuring NGINX...'
        rm -f /tmp/app.aibers.health
        cat $AIBERS/frontend/etc/nginx/app.aibers.health | sed "s/IP/$IP"/g >/tmp/app.aibers.health
        cp /tmp/app.aibers.health /etc/nginx/sites-available/
        ln -sf /etc/nginx/sites-available/app.aibers.health /etc/nginx/sites-enabled/

        systemctl restart nginx
        if [ $? != 0 ]; then
            echo "Command failed"
            exit
        fi
        echo "Finished configuring NGINX"
    else
        echo 'NGINX already configured'
    fi

}

function main() {
    if [ "$1" = "-i" ]; then
        /usr/bin/echo "Installing all the required software..."
    else
        /usr/bin/echo "Usage: $0 -i"
        exit
    fi

    echo "Creating log file $LOG"
    rm -f $LOG
    echo "" >$LOG

    echo "Updating base OS to latest patches and software..."
    apt update >>$LOG 2>&1
    echo "Base OS update done."
    echo

    postgres
    node
    nginx
}

main "$1"
