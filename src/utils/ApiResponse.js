class ApiResponse{
    constructor(statusCode, data, message='Success'){
        this.statusCode= statusCode
        this.data= data
        this.message= message
        this.success= statusCode < 400
    }
}

// const response = new ApiResponse(300, { id: 2, name: "Aman" });
// console.log(response);      ONLY FOR PRACTICE AND CHECKING CODE WORKING GOOD OR NOT!

export{ApiResponse}