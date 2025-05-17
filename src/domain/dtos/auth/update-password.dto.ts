import { regularExps } from "../../../config";




export class UpdatePasswordDto {

    private constructor(
        public email: string,
        public password: string,
        public token: string
    ) {}

    static create( object: { [key: string]: any } ): [string?, UpdatePasswordDto?] {
        const { email, password, token } = object;

        if(email) {
            if( !email ) return [ 'Missing email' ];
            if( !regularExps.email.test(email) ) return [ 'Email is not valid' ];
        }
        if( !password ) return [ 'Missing password' ];
        if( password.length < 6 ) return [ 'Password must be at least 6 characters' ];
        if( !token ) return [ 'Missing token' ];

        return [undefined, new UpdatePasswordDto( email, password, token )];
    }

}