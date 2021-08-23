1. Install Ubuntu Server v. 20.04
2. Make sure OpenSSH server is installed if not then run this command (sudo apt install openssh-server)
3. Make Linux user aibers either during installation or after
4. Login as user aibers in Linux server
5. Make sure following packages are installed
   - sudo apt-get install python3 build-essential net-tools npm
   - sudo npm -g install npm@~6
6. Under home directory of user aibers run:
   - git clone https://gitlab.com/Shozi/aibers_web.git
7. Run initialize_software.sh script as user aibers (created in step 3)
8. Configure PostgreSQL
   1. sudo -i -u postgres (login as user postgres in terminal)
   2. psql
   3. ALTER user postgres PASSWORD 'aibershealth'; (change password)
   4. Change back to user aibers in terminal
   5. run script initialize_db.sh in api/db/
9. Configure SSL(certbot) - for production only
   1. sudo snap install --classic certbot (to install certbot)
   2. sudo ln -s /snap/bin/certbot /usr/bin/certbot (to prepare certbot command)
   3. sudo certbot --nginx (get certificate and configure nginx automatically)

- Note: If you want to run the script again from a clean state,
  make sure to remove the NGINX configuration file:
  sudo rm /etc/nginx/sites-available/app.aibers.health

- To populate database, please run test_db.sh under /api/db
