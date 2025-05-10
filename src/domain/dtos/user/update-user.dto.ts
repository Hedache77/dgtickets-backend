import { Role } from "@prisma/client";
import { regularExps } from "../../../config";




export class UpdateUserDto {

    private constructor(
        public readonly id: number,
        public isUpdatePassword: boolean,
        public firstName?: string,
        public lastName?: string,
        public userType?: Role,
        public email?: string,
        public cityId?: number,
        public password?: string,
        public photo?: string
    ) {}

    static create( object: { [key: string]: any } ): [string?, UpdateUserDto?] {
        const { id, isUpdatePassword, firstName, lastName, userType, email, cityId, password = '', photo = '' } = object;

        if( !id ) return [ 'Missing id' ];
        if( !isUpdatePassword ) return [ 'Missing isUpdatePassword' ];
        // if( !firstName ) return [ 'Missing firstName' ];
        // if( !lastName ) return [ 'Missing lastName' ];
        if(email) {
            if( !email ) return [ 'Missing email' ];
            if( !regularExps.email.test(email) ) return [ 'Email is not valid' ];
        }
        if(isUpdatePassword === 'true') {
            if( !password ) return [ 'Missing password' ];
            if( password.length < 6 ) return [ 'Password must be at least 6 characters' ];
        }
        // if( !cityId ) return [ 'Missing city' ];
        // if( !userType ) return [ 'Missing role' ];
    
        return [undefined, new UpdateUserDto( id, isUpdatePassword, firstName, lastName, userType, email, cityId, password, photo )];
    }

}