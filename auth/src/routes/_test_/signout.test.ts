import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
   await global.signin();

   const response = await request(app)
      .post('/api/users/signout')
      .send({})
      .expect(200);
   // console.log('response2', response.get('Set-Cookie'));
   const cookie=response.get('Set-Cookie');
   if(!cookie) return expect(cookie).toBeDefined();
   expect(cookie[0]).toEqual(
     "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
   );
})

