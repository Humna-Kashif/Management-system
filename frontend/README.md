NOTE:
   FOR LOCAL DEVELOPMENT WE ARE USING "http" ONLY 
      - http:localhost:3000         (frontend) 
      - http://localhost:8090/APIs  (backend) 
      - http://"your VM IP"         (frontend)
      - http://"your VM IP"/APIs    (backend)

   FOR PRODUCTION WE ARE USNIG "https" ONLY:
      - https://app.aibers.health         (frontend)
      - https://app.aibers.health/APIs    (backend)


TO RUN FRONTEND
   Without parameters: npm run start-app

   - By default baseURL = https://app.aibers.health
   - By default authentication = ENABLE

YOU CAN CHANGE DEFAULT VALUES BY PASSING AUGUMENTS IN COMMAND LINE LIKE:
   - npm run start-app --env=http://localhost:8090 --a=DISABLE
   - OR
   - npm run start-app --env=http://localhost:8090
   - OR
   - npm run start-app --a=DISABLE

   Here: "env" argument is used to set your API's environment (like: http://"your VM IP" OR http://localhost:8090 OR https://app.aibers.health)
         & 'a' argument is used to disable authentication process(like jwt creations/verifications and firebase authentications)

NOTE: IF YOU WANT TO DISABLE AUTHENTICATION FOR DEVELOPMENT PURPOSE THEN
   1. Pass --a=DISABLE argument while running frontend code (npm run start-app --a=DISABLE)
   2. Change module.exports.auth="DISABLE" in (api/src/config.js)

BUILD CREATION:
For test build run: 		   npm run testbuild --env=http://192.168.8.110 --a=DISABLE
For production build run: 	npm run build
For staging build run:     npm run build --env=https://staging.aibers.health
