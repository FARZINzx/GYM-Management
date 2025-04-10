import dotenv from 'dotenv'

dotenv.config();

const env = {
     PORT: process.env.PORT,
     NODE_ENV: process.env.NODE_ENV,
     DB : {
          HOST: process.env.DB_HOST,
          NAME: process.env.DB_NAME,
          PORT: process.env.DB_PORT,
          USER: process.env.DB_USER,
          PASSWORD: process.env.DB_PASSWORD
     },
     JWT : {
          SECRET: process.env.JWT_SECRET,
          EXPIRES_IN: process.env.JWT_EXPIRES_IN
     },

     validate : () => {
          const required = [
               'DB_USER', 'DB_PASSWORD' , 'DB_HOST' , 'DB_PORT' , 'JWT_SECRET'
          ]

          required.forEach(key => {
               if(!process.env[key]) {
                    throw new Error(`${key} is not defined in the environment variables`)
               }
          } )
     }
}

env.validate();

export default env;

