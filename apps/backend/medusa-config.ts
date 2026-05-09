import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    disable: process.env.NODE_ENV === "production" || process.env.DISABLE_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "https://moncatu-backend-production.up.railway.app",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "https://vonoaweb.github.io,http://localhost:8000,http://localhost:5500",
      adminCors: process.env.ADMIN_CORS || "https://moncatu-backend-production.up.railway.app,http://localhost:9000,http://localhost:5173",
      authCors: process.env.AUTH_CORS || "https://vonoaweb.github.io,https://moncatu-backend-production.up.railway.app,http://localhost:8000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  }
})
