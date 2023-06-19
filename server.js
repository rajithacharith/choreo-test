import express from 'express'
import { createSSRApp } from 'vue'
// import cookieParser from 'cookie-parser'
import cookieParser from 'cookie-parser';
import { renderToString } from 'vue/server-renderer'
import { AsgardeoExpressClient } from "@asgardeo/auth-express";
import config from "./config.json" assert { type: "json" };
import url from "url";
// import a vue component
// import home from './components/home.vue';

AsgardeoExpressClient.getInstance(config);

const app = express();

// Use cookie parser in the Express App.
app.use(cookieParser())

//Initialize Asgardeo Express Client
const authClient = AsgardeoExpressClient.getInstance(config);

//Define onSignIn method to handle successful sign in
const onSignIn = (res, response) => {
  if (response) {
    res.status(200).send(response);
  }
};

//Define onSignOut method to handle successful sign out
const onSignOut = (res) => {
  res.status(200).send("Sign out successful");
};

//Define onError method to handle errors
const onError = (res, error) => {
  if(error){
    res.status(400).send(error);
  }
};

//Use the Asgardeo Auth Client
app.use(
  AsgardeoExpressClient.asgardeoExpressAuth(onSignIn, onSignOut, onError)
);

//At this point the default /login and /logout routes should be available.
//Users can use these two routes for authentication.

//A regular route
app.get("/", (req, res) => {
    const app = createSSRApp({
        data: () => ({ count: 1 }),
        template: `
        <div>
            <h1>Vue SSR Example</h1>
            <p v-if="count == 1">Count: {{ count }}</p>
        </div>`
    })

    renderToString(app).then((html) => {
        res.send(`
        <!DOCTYPE html>
        <html>
            <head>
            <title>Vue SSR Example</title>
            </head>
            <body>
            <div id="app">${html}</div>
            </body>
        </html>
        `)
    })
});

//A Protected Route

//Define the callback function to handle unauthenticated requests
const authCallback = (res, error) => {
  if(error){
    res.status(400).send(error);
  }
  // Return true to end the flow at the middleware.
  return true;
};

//Create a new middleware to protect the route
const isAuthenticated = AsgardeoExpressClient.protectRoute(authCallback);

app.get("/protected", isAuthenticated, async (req, res) => {
    const userData = isAuthenticated
      ? await req.asgardeoAuth.getBasicUserInfo(req.cookies.ASGARDEO_SESSION_ID) : null;
    
    // import template in component/home.vue
    console.log(userData);



    const app = createSSRApp({
        data: () => ({ userData: userData }),
        template: `
        <div>
            <p v-if="userData.applicationRoles === 'admin'">Welcome Admin {{ userData.username }}</p>
            <p v-else>Welcome {{ userData.username }}</p>
        </div>`
    })

    renderToString(app).then((html) => {
        res.send(`
        <!DOCTYPE html>
        <html>
            <head>
            <title>Vue SSR Example</title>
            </head>
            <body>
            <div id="app">${html}</div>
            </body>
        </html>
        `)
    })
});

//Start the express app on PORT 3000
app.listen(3000, () => { console.log(`Server Started at PORT 3000`);});