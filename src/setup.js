import express from "express";
import sirv from "sirv";
import compression from "compression";
import csurf from "csurf";
import { setup as authSetup } from "./auth.js";
// import dotenv from "dotenv";
import session from "express-session";
import makeStore from "connect-redis";

const { NODE_ENV } = process.env;
const dev = NODE_ENV === "development";
if (dev) {
  require("dotenv").config();
}

// Uncomment these lines to set up cors for your bucket
// const {Storage} = require('@google-cloud/storage');
// const storage = new Storage();

// const bucket = storage
//   .bucket(process.env.GOOGLE_STORAGE_BUCKET)

// const corsConfiguration = [
//   {
//     "origin": ["*"],
//     "responseHeader": ["Content-Type"],
//     "method": ["GET", "HEAD", "DELETE", "PUT"],
//     "maxAgeSeconds": 3600
//   }
// ]
// bucket.setCorsConfiguration(corsConfiguration)
//   .then(result => console.log(result))
//   .catch(err => console.error(err))

const redis = require("redis");
// import firesession from 'firestore-store'

const RedisStore = makeStore(session);
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

if (dev) {
  // const result = dotenv.config();
  // if (result.error) {
  //   throw result.error;
  // }
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // eslint-disable-line
}
if (dev) {
}

export function setup(sapper, options = {}) {
  const app = express();

  app.enable("strict routing");
  app.disable("x-powered-by");
  app.set("trust proxy", true);

  const sessionMiddleware = session({
    store: new RedisStore({ client }),
    secret: process.env.COOKIE_KEY || "randome stuff",
    resave: false,
    rolling: true,
    saveUninitialized: false,
    name: process.env.COOKIE_NAME || "__session",
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: !dev,
      name: process.env.COOKIE_NAME || "__session",
      httpOnly: true,
      sameSite: "lax"
    }
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(
    express.json({
      type: [
        "application/json",
        "application/activity+json",
        "application/ld+json"
      ],
      limit: "100mb"
    })
  );
  app.use(sessionMiddleware);
  authSetup(app);
  if (dev) {
    app.use(compression({ threshold: 0 }), sirv("static", { dev }));
  } else {
    app.use(compression({ threshold: 0 }), sirv("static"));
  }
  app.use(
    "/",
    (req, res, next) => {
      if (req.path === "/callback") {
        return next();
      } else if (req.path === "/") {
        return res.redirect("/library/all/all");
      } else {
        return csurf()(req, res, next);
      }
    },
    (req, res, next) => {
      if (req.body && req.body._csrf) {
        delete req.body._csrf;
      }
      next();
    },
    // (req, res, next) => {
    //   res.cookie("XSRF-TOKEN", req.csrfToken(), {httpOnly: false});
    //   next();
    // },
    sapper.middleware({
      session: (req, res) => {
        return { user: req.user, csrfToken: req.csrfToken() };
      }
    })
  );
  return app;
}
