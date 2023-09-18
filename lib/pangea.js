const {PangeaConfig, EmbargoService, PangeaErrors} = require("pangea-node-sdk");

const token = process.env.PANGEA_EMBARGO_TOKEN;
const config = new PangeaConfig({ domain: process.env.PANGEA_DOMAIN });
const embargo = new EmbargoService(token, config);

async function ipCheck(ip) {  
    try {
      const response = await embargo.ipCheck(ip); 
      return response.result;
    } catch (e) {
      if (e instanceof PangeaErrors.APIError) {
        console.log("Error", e.summary, e.errors);

      } else {
        console.log("Error: ", e);
      }
      throw new Error(`Error during checking Embargo IP ${e}`);
    }
}

module.exports = ipCheck;
