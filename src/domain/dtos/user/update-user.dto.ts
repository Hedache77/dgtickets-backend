import { Role } from "@prisma/client";
import { regularExps } from "../../../config";




export class UpdateUserDto {

    private constructor(
        public readonly id: number,
        public firstName: string,
        public lastName: string,
        public userType: Role,
        public email: string,
        public password: string,
        public cityId: number,
        public photo?: string
    ) {}

    static create( object: { [key: string]: any } ): [string?, UpdateUserDto?] {
        const { id, firstName, lastName, userType, email, password, cityId, photo = '' } = object;

        if( !id ) return [ 'Missing id' ];
        if( !firstName ) return [ 'Missing firstName' ];
        if( !lastName ) return [ 'Missing lastName' ];
        if( !email ) return [ 'Missing email' ];
        if( !regularExps.email.test(email) ) return [ 'Email is not valid' ];
        if( !password ) return [ 'Missing password' ];
        if( password.length < 6 ) return [ 'Password must be at least 6 characters' ];
        if( !cityId ) return [ 'Missing city' ];
        if( !userType ) return [ 'Missing role' ];
    
        return [undefined, new UpdateUserDto( id, firstName, lastName, userType, email, password, cityId, photo )];
    }

}