import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Employee } from "../models/employees.model.js";

const addEmployee = asyncHandler(async (req,res)=>{

    const { employeeNumber, name, location, department, jobTitle } =  req.body

    const employee = await Employee.create({
        employeeNumber,
        name,
        location,
        department,
        jobTitle,
})

    if(!employee){
        throw new ApiError(500, "Unable to create employee")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Employee created successfully",
            employee
        )
    )
})

const getAllEmployees = asyncHandler(async (req,res)=>{
    const employees = await Employee.find()

    if(employees === undefined){
        throw new ApiError(500, "Unable to fetch employees")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Employees fetched successfully",
            employees
        )
    )

}) 

const deleteEmployee = asyncHandler(async (req,res)=>{

    const { employeeNumber } = req.body

    if(!employeeNumber){
        throw new ApiError( 400, "Employee number is required" )
    }

    const deletedEmployee = await Employee.findOneAndDelete({ employeeNumber })

    if(deletedEmployee === undefined){
        throw new ApiError(500, "Unable to fetch and delete employee")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Employees deleted successfully",
            deletedEmployee
        )
    )

}) 

export { addEmployee, getAllEmployees, deleteEmployee }