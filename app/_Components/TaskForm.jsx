
"use client";

import HelperFunctions from "./helper.js";
import {useState,useContext} from "react";
import {HomepageContext, currentEditedTaskID} from "../page.js"
import Image from "next/image";
const {throwUINotification, saveInfoToDB,_taskID:taskID, alterTaskDefinition,fetchTaskDefinition} = HelperFunctions;

import LoadingIcon from "../../public/fill-the-circle.svg";
function onTaskOperated(event,_infoTable,_setCRUDFormStatus,_setCRUDFormVisibility){
 /*
   _infoTable ={
    TASK_NAME: TASK_NAME
    TASK_DESCRIPTION: TASK_DESCRIPTIPON_STRING
    DUE_DATE:     DUE_DATE_OBJECT
    BEGIN_DATE:   BEGINNING_DATE_OBJECT
    TASK_PRIORITY:    TASK_PRIORITY_INTEGER
    TASK_STATUS:      TASK_STATUS_DROPDOWN_MENU_SELECITON
   }



 */
    _infoTable = _infoTable ||{
    TASK_NAME:"New Task",
    TASK_DESCRIPTION:"You Just Made a New Task. You just need to add a description :)",
    BEGIN_DATE: (new Date()).toDateString(),
    DUE_DATE:  (new Date()).toDateString(),
    TASK_PRIORITY:0,
    TASK_ID: currentEditedTaskID?.current
   }
    const _TASK_ID = _infoTable.TASK_ID
    for(const [dataName,dataValue] of new FormData(event.target)){
     console.log(_infoTable[dataName],dataValue)
     if(dataValue) _infoTable[dataName] = dataValue;
  };
// This function does whatever it should do when the user clicks:
  //Initial:
  //[1]- If newly Task is being creating 
  /* 
   1- Check if at least a Name was provided
    -IF TRUE, then proceed with the following
      1.1- take all info and store them into Web Local Storage, then when that is done, send it to the 

    -IF FALSE, show a small popup message(alert) that explains the error

  */


  /*-*-*-*-*-->*/
   if(!_TASK_ID){
    //INFO VALIDATION
     if(!_infoTable.TASK_NAME){throwUINotification(`Task Name Must be Valid an Not Empty`,"error"); return }
    }else{
      //[2]- If updating a task 
      /*
     */
   }

     //UI EFFECTS (BEFORE SAVE)
      _setCRUDFormStatus("loading");
     /*<*-*-*-*-*-*/


    try{
     /*-*-*-*-*-->*/
     //DATABASE EFFECTS 
       saveInfoToDB(_infoTable).finally(/* ({statusCode} */_=>{
        /*-*-*-*-*-->*/
   
         //UI EFFECTS (AFTER SAVE)
        _setCRUDFormStatus("normal");
        _setCRUDFormVisibility({status:false,TASK_ID:false})
        throwUINotification((_TASK_ID)?"Task Has Been Modified and Saved to Database Succesfully":"New Task Has Been Added Succesfully","success");
         /*-*-*-*-*-->*/
 
      }).catch(e=>{
          console.error(e);

       });
     }catch(e){
       console.error(e);
    }
   /*-*-*-*-*-->*/





}

export default function TaskForm() {
 const {setCRUDFormVisibility, CRUDFormVisibility, setCRUDFormStatus, CRUDFormStatus} = useContext(HomepageContext)
 const TaskInfo = (CRUDFormVisibility.TASK_ID)?fetchTaskDefinition(CRUDFormVisibility.TASK_ID):{};
  console.log("CRUDFormVisibility: ",CRUDFormVisibility,TaskInfo)
 return (
    // <form style={{position:((visibilityStat)?"relative":"fixed")}}className="block fixed w-full max-w-xl rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-5 shadow-2xl shadow-black/30 sm:p-6">
     <form hidden={!CRUDFormVisibility.status} className="mt-[1%] z-100  flex flex-col h-[80vh] fixed overflow-y-scroll ml-[2%] rounded-2xl  bg-[#3c0252]  sm:p-6" onSubmit={(event)=>{   //Prevent From Submission //
       event.preventDefault();
        //*****************//
        onTaskOperated(event,TaskInfo,setCRUDFormStatus, setCRUDFormVisibility)}}
      >
      <button type="button" className=" Button w-12 py-2 px-3 rounded self-end bg-[#04aabd] cursor-pointer" onClick={()=>{setCRUDFormVisibility({...CRUDFormVisibility,status:false})}}>X</button>
    <fieldset disabled={CRUDFormStatus=="loading"?true:false}>
      <div className=" mb-6">
        <h2 className=" text-lg font-semibold text-zinc-100 ">
          Create Task
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Enter the task information below.
        </p>
      </div>
      <div className="space-y-5 task-form-loading">
        {/* Task Name */}
        <div>
          <label
            htmlFor="TASK_NAME"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Task Name
          </label>

          <input
            id="TASK_NAME"
            name="TASK_NAME"
            type="text"
            defaultValue={TaskInfo?.TASK_NAME}
            placeholder="Enter task name"
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-zinc-200 outline-none transition loading placeholder:text-zinc-600 focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10"
          />

        </div>

        {/* Task Description */}
        <div>
          <label
            htmlFor="TASK_DESCRIPTION"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Task Description
          </label>

          <textarea
            id="TASK_DESCRIPTION"
            name="TASK_DESCRIPTION"
            rows={4}
            defaultValue={TaskInfo?.TASK_DESCRIPTION}
            placeholder="Describe the task..."
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Begin Date */}
          <div>
            <label
              htmlFor="BEGIN_DATE"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Begin Date
            </label>

            <input
              id="BEGIN_DATE"
              name="BEGIN_DATE"
              type="date"
              defaultValue={(new Date(TaskInfo?.BEGIN_DATE || Date())).toISOString().split('T')[0]}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-zinc-200 outline-none transition focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10"
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="DUE_DATE"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Due Date
            </label>

            <input
              id="DUE_DATE"
              name="DUE_DATE"
              type="date"
              defaultValue={(new Date(TaskInfo?.DUE_DATE || Date() )).toISOString().split('T')[0]}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-zinc-200 outline-none transition focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10"
            />
          </div>
        </div>


        {/* Task Priority& Status */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-1 ">
        <div >
          <label
            htmlFor="TASK_PRIORITY"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Task Priority
          </label>

          <input
            id="TASK_PRIORITY"
            name="TASK_PRIORITY"
            type="number"
            step="1"
            defaultValue={TaskInfo?.TASK_PRIORITY}
            placeholder="Enter priority"
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10"
          />
        </div>
      {/* TASK STATUS */}




    <div className="self-center">
        <label
            htmlFor="task-status"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Task Priority
          </label>
      <div className="relative">
        <select
          id="task-status"
          name="TASK_STATUS"
          defaultValue={TaskInfo?.TASK_STATUS || "Ongoing"}
          className="
            w-full appearance-none rounded-xl
            border border-gray-200 bg-white
            px-4 py-3 pr-10
            text-sm font-medium text-gray-800
            shadow-sm outline-none
            transition-all duration-200
            hover:border-gray-300
            focus:border-blue-500
            focus:ring-4 focus:ring-blue-500/10
          "
        >
          <option value="Completed">
            ✓ &nbsp; Completed
          </option>

          <option value="Ongoing">
            ◉ &nbsp; Ongoing
          </option>

          <option value="Paused">
            ⏸ &nbsp; Paused
          </option>
        </select>

        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
   </div>
 </div>

      {/* Submit */}
      <button
        type="submit"
        value="Submit"
        className="text-center h-15 mt-6 w-full rounded-xl bg-gradient-to-r from-[#6b0561] to-[#58056b] text-sm font-semibold text-black shadow-lg shadow-amber-950/30 transition hover:from-[#770391] cursor-pointer hover:to-[#9b04bd] pointer "
        disabled={(CRUDFormStatus=="loading")?true:false}
      >  

       {(CRUDFormStatus=="loading")?<Image src={LoadingIcon} className="opacity-50 flex-1 object-contain w-10 self-center justify-self-center"/>:(taskID())?"Save Task":"Create Task"}
      </button>
  </fieldset>

    </form>
  );
}

