
const Errors = {
    //1**: "User Errors",
    "100": "User already exists",
    "101": "User does not exist",
    "102": "User has been updated",
    "103": "User has been deleted",    
    "104": "No user match",
    "105": "Password does not match",    
    "106": "Error generating hashed token",
    //2**: "Customer Errors",
    "200": "Customer already exists",
    "201": "Customer does not exist",
    "202": "Customer has been updated",
    "203": "Customer has been deleted",
    "204": "No customer match",
    //3**: "OPCO Errors",
    "300": "OPCO already exists",
    "301": "OPCO does not exist",
    "302": "OPCO has been updated",
    "303": "OPCO has been deleted",
    "304": "No OPCO match",


}


module.exports = function generateError(ErrCode) {

    return new Error(Errors[ErrCode]);

}