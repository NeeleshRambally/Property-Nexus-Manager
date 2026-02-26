import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { readFileSync } from "fs";
import { join } from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Version check endpoint
  app.get("/api/version", (req, res) => {
    try {
      // In production (CJS), __dirname is available
      // In development (ESM), we need to use import.meta
      const baseDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
      const packageJsonPath = join(baseDir, "..", "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      res.json({ version: packageJson.version });
    } catch (error) {
      res.status(500).json({ error: "Failed to read version" });
    }
  });

  return httpServer;
}
