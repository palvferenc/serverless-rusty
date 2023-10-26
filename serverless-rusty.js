"use strict";

const spawn = require("child-process-ext/spawn");

class RustPlugin {
  constructor(serverless) {
    this.serverless = serverless;
    this.provider = serverless.getProvider("aws");
    this.hooks = {
      init: this.init(),
      "package:package": this.package(),
    };
  }

  init() {
    this.service = this.serverless.service;
    this.checkProvider();
    //console.log("Serverless instance:", this.serverless);
    //console.log("Service:", this.service);
  }

  checkProvider() {
    if (this.service.provider.name !== "aws") {
      throw new this.serverless.classes.Error(
        `${this.service.provider.name} provider is not supported`
      );
    }
    if (this.service.provider.architecture !== ("arm64" || "x86_64")) {
      throw new this.serverless.classes.Error(
        `${this.service.provider.architecture} architecture is not supported`
      );
    }
  }

  package() {
    try {
      let args = ["lambda", "build", "--release"];
      if (this.service.provider.architecture === "arm64") {
        args.push("--arm64");
      }
      args.push("--output-format", "zip");
      spawn("cargo", args, {
        shell: process.env.SHELL,
      });
      this.serverless.cli.log("Lamda(s) built successfully");
    } catch (error) {
      throw new this.serverless.classes.Error(
        `Error while trying to build your lambda(s) with cargo lambda: ${error}`
      );
    }
  }
}

module.exports = RustPlugin;
