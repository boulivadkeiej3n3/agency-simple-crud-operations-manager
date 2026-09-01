//This is all necessary JS CLient code

let exports ={}
import {currentEditedTaskID} from "../page.js";
import DBConfig              from "./dbconfig.js"

const SupabaseConfigs = {
  method:"POST",
  /******** VERY DANGEROUS AND ONLY CURRENT UNTIL EXTERNAL SERVER ***************/
  headers:{
    apikey:DBConfig.apikey,
    Authorization:DBConfig.authorization,
    "Content-Type": "application/json"
   } 
  }
async function sendToDB(_data){
 try{

 return await fetch('https://wnwxzzuaiwxvmrvfgjto.supabase.co/functions/v1/hyper-api' ,{
  method:"POST",
  /******** VERY DANGEROUS AND ONLY CURRENT UNTIL EXTERNAL SERVER ***************/
  headers:{
    apikey:DBConfig.apikey,
    Authorization:DBConfig.authorization,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(_data)
  });
 }catch(e){
  console.error(e);
 }

}
async function fetchDBTasks(_count=30,_config={}){
 //Fetch the Latest number of '_count' of Tasks and return it back;
  try{
    const DBResponse = await fetch("https://wnwxzzuaiwxvmrvfgjto.supabase.co/functions/v1/clever-action", {
    ...SupabaseConfigs,
    body:JSON.stringify({
      count:_count
    })
  });
    return  await DBResponse?.json();
  }catch(e){
    throw new Error(e);
  }
}
async function generateTASK_ID(taskInfo) {
 //ERROR HANDLING:
     if(taskInfo.constructor.name!=="Object") throw new Error(`[generateTASK_ID] 'taskInfo' Passed MUST BE OF TYPE Object{}`);


 //Merge all task info values with the current date+time to ensure no hash gets matched to any other hash 
  const _input = Object.values(taskInfo).join("") + Date.now();

  // 1. Convert string to a byte array
  const encoder = new TextEncoder();
  const data = encoder.encode(_input);
  
  // 2. Hash the data using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // 3. Convert the buffer back into a readable Hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

function _taskID(_newTASK_ID){
  if (!_newTASK_ID) return currentEditedTaskID.current 
    currentEditedTaskID.current = _newTASK_ID
  console.log("TASK ID HAS CHANGED TO: ", _newTASK_ID, "\n by [",_TASK_ID.caller.name,"]");
}
async function saveInfoToDB(InfoObject, saveLocally=true){
  //Error Handling
   if(InfoObject.constructor.name!=="Object") throw new Error(`[saveInfo] 'InfoObject' Passed MUST BE OF TYPE Object{}`);
   //Main Code:

    const systemMessage = {
      statusCode:0, 
      /*
       statusCode Options:
       [0]- SUCCESS
       [1]- WARNING 
       [2]- ERROR

      */
      msg:""
    }

     InfoObject.TASK_ID =InfoObject.TASK_ID || await generateTASK_ID(InfoObject);
    try{

  

    //[2] - SAVE TO A DATABASE BY CALLING AN EDGE FUNCTIONS
     //Change the Keys to their corrospondent Database naming:
      const DBData = {};
      // Object.entries(InfoObject).map(([JSName,Value])=>{
      //   DBData[DBConfig.nameExchangeJStoDB[JSName]] = Value;
      // });
      systemMessage.msg=  await sendToDB(DBData);
      systemMessage.statusCode=0;
      //[2]- SAVE THE NEWLY ADDED/MODIFIED ENTRY LOCALLY:
      if(saveLocally){
       //Saves to Web storage
       window.sessionStorage.setItem(InfoObject.TASK_ID,JSON.stringify(InfoObject)); 
       console.log("Task ID: ", InfoObject.TASK_ID)
      }

    }catch(e){
         systemMessage.statusCode = 2;
         systemMessage.msg=e.message;
         console.error(e);
      
    }
    return systemMessage
   
}
function throwUINotification(_message,_type="info",_optionalElement){
 //This Throws a UI erros and logs it into the Session Storage:
	//JUST ALERT MESSAGE FOR NOW
	if(!_message || (_optionalElement&& !_optionalElement.className)) throw new Error(`[trowUIError]'_message' or '_optionalElement' is invalid `);
	switch(_type){
	case "error":
			alert(_message) //TEMP
		break;

    case "success":
    		alert(_message) //TEMP
    	break;

    default:
    		alert(_message) //TEMP
	}
	//MAKE A NEW ERROR ELEMENT AND ADD THIS TO IT_optionalElement
  
}
function fetchTaskDefinition(_TASK_ID){
    const targetTask = window.sessionStorage.getItem(_TASK_ID);
   if(!targetTask) throw new Error(`[fetchTaskDefinition] _TASK_ID="${_TASK_ID}" Passed Doesn't exist`);
   return JSON.parse(targetTask)
}
async function alterTaskDefinition(_TASK_ID,_newObject){
  //ERROR HANDLING:
   if(_newObject?.constructor.name!=="Object") throw new Error(`[alterTaskDefinition] '_newObject' PASSED MUST BE OF TYPE 'Object{}'`);
   if(_newObject["TASK_ID"]){console.log(`[alterTaskDefinition] WARNING! '_newObject.TASK_ID' PASSED WILL BE OMITTED. TASK ID MUST NOT CHANGE FROM THIS FUNCTION `); delete _newObject["TASK_ID"];}
 
  //MAIN CODE:



   
   let TaskStoredDefinition = window.sessionStorage.getItem(_TASK_ID);
   Object.entries(_newObject).map(([newDefinitionKey,newDefinitionValue])=>{
     const findingRegex = new RegExp(`(?<=\"${newDefinitionKey}\"\:(\s|\")*)[A-z0-9]+`);
      TaskStoredDefinition= TaskStoredDefinition.replace(findingRegex,newDefinitionValue);
   });
   //[1]-> SAVE MODIFICATION INTO DATABASE:
   let DBResponse;
   try{
    const DBData = {[DBConfig.nameExchangeJStoDB["TASK_ID"]]:_TASK_ID};
      Object.entries(_newObject).map(([JSName,Value])=>{
        DBData[DBConfig.nameExchangeJStoDB[JSName]] = Value;
      });
      console.log("DBData: \n", DBData);
     DBResponse = await sendToDB(DBData);
  
   }catch(e){
     console.error(e);
     throw new Error(e);
   }
     //[2]-> Save MODIFICATION Locally:
     window.sessionStorage.setItem(_TASK_ID,TaskStoredDefinition)
  return DBResponse;

}
async function deleteTaskDefinition(TASK_ID){

  const targetTask = window.sessionStorage.getItem(TASK_ID);
  if(!targetTask) throw new Error(`[deleteTaskDefinition] TASK_ID="${TASK_ID}" Passed Doesn't exist`);
  try{

  //[1]-> REMOVE TASK FROM DB 
   const DBResponse = await sendToDB({
    TASK_ID:TASK_ID,
    OP_CODE:"delete"
  });
  //[2]-> REMOVE TASK FROM LOCAL STORAGE
    window.sessionStorage.removeItem(TASK_ID);
   return DBResponse;
  }catch(e){
   console.error(e);
   throw new Error(e);
  }
}


exports ={
throwUINotification,
saveInfoToDB,
_taskID,
alterTaskDefinition,
deleteTaskDefinition,
fetchTaskDefinition,
fetchDBTasks
}

/***** TEST LAB ******/
/**********/
export default exports;

