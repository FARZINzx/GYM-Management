import {query} from "../config/db.js";


export async function getAllPersonnel() {
    try{
        const {rows} = await query(`
            SELECT
                e.id , e.first_name, e.last_name , r.role_name
            FROM
                employee AS e
            JOIN
                roles AS r ON e.role_id = r.role_id 
            Where r.role_name NOT IN ('admin' , 'manager')`);
        return {success : true , message : 'OK' , data: rows , status : 200};
    }catch (e) {
        return {success : false , message : e.message , status : 500};
    }
}