import {format} from 'date-fns';


export class User{
    constructor(user={}){
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        // It is best practice to exclude the password from the response model
        // this.password = user.password; 
        this.created_at = user.created_at ? format(new Date(user.created_at),'yyyy-MM-dd HH:mm:ss a') : null;
        this.role_id = user.role_id;
    }
}

export class Users{
    constructor(users=[]){
       return users.map(user=>new User(user));
    }
}