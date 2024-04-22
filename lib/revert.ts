import { network } from "hardhat";
import { expect } from "chai";

function hasProperty(obj: any, prop: string): obj is {[key: string]: any} {
  return obj !== null && obj !== undefined && obj.hasOwnProperty(prop);
}


// apply to hardhat and evmos 
export function expectRevert(e:any,expectRevertString:string) {
  let reason = "";
  
  if(network.name == "hardhat" && hasProperty(e,"message") && typeof e.message === "string" ) {

    const start = e.message.indexOf("'");
    const end = e.message.indexOf("'",start+1);
    reason = e.message.slice(start+1,end);

  } else if(hasProperty(e,"reason") && typeof e.reason === "string") {
    reason = e.reason.slice(e.reason.indexOf("reverted:") + 10);
    if(reason.indexOf("invalid request") > 0) {
      reason = reason.slice(0,reason.indexOf("invalid request") - 2)  // 2 = ": "
    }
    

  } else {
    throw new Error("Error don't have revert string")
  }

  expect(reason).to.equal(expectRevertString);
}