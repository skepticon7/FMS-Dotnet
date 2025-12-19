import axios from "axios";
const apiGateway = import.meta.env.VITE_API_GATEWAY

const getAuthConfig = () => ({
    headers : {
         Authorization : `Bearer ${localStorage.getItem("jwtToken")}`
    }
});

//post requests

export const login = async (userCredentials) => {
    // eslint-disable-next-line no-useless-catch
    try{
        console.log("backend server : " + apiGateway);
        const response = await axios.post(`${apiGateway}/user-service/api/auth/login` , userCredentials);
        console.log(response)
        return response;
    }catch (e) {
        throw e;
    }
}

export const saveSuperuser = async (newSuperuser) => {
    delete newSuperuser.confirmPassword;
    delete newSuperuser.role
    try {
        const response = await axios.post(`${backendServer}/api/auth/createSuperuser` , newSuperuser , {...getAuthConfig()})
        console.log(response);
        return response;
    }catch (e){
        throw e;
    }
}

export const saveDoctor = async (values) => {
    try {
        const response = await axios.post(`${apiGateway}/user-service/api/doctor/createDoctor` , values , {...getAuthConfig()})
        return response;
    }catch (e){
        throw e;
    }
}

export const savePatient = async (values) => {
    try {
        const response = await axios.post(`${apiGateway}/user-service/api/patient/createPatient` , values , {...getAuthConfig()})
        return response;
    }catch (e){
        throw e;
    }
}

export const saveTechnican = async (newTechnician , createdById , role) => {
        newTechnician.createdBy = createdById;
        newTechnician.superUser = role === "SUPERUSER"
    delete newTechnician.confirmPassword;
    delete newTechnician.role;

    try {
        const response = await axios.post(`${backendServer}/api/auth/createTechnician` , newTechnician , {...getAuthConfig()})
        console.log(response);
        return response;
    }catch (e){
        throw e;
    }
}

export const saveSupervisor = async (newSupervisor , createdById = null , role) => {
    newSupervisor.superUser = role === "SUPERUSER"
    newSupervisor.createdBy = createdById;
    delete newSupervisor.confirmPassword;
    delete newSupervisor.role;
    try {
        const response = await axios.post(`${backendServer}/api/auth/createSupervisor` , newSupervisor , {...getAuthConfig()})
        console.log(response)
        return response;
    }catch (e) {
        throw e;
    }
}

export const confirmPassword = async (password , userId) => {
    try {
        const response = await axios.post(`${apiGateway}/user-service/api/auth/confirmPassword` , {password , id : userId} , {...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw e;
    }
}

export const saveSite = async (newSite , role , userId) => {
    newSite.createdById = userId;
    console.log(newSite)
    try {
        if((role !== "SUPERUSER"))
            throw new Error("Invalid role")
        const response = await axios.post(`${backendServer}/api/sites/createSite` , newSite , {...getAuthConfig()})
        console.log(response)
        return response;
    }catch (e) {
        throw e;
    }
}

export const saveInterventionType = async (newInterventionType) => {
    try {
        const response = await axios.post(`${backendServer}/api/interventionType/createInterventionType` , newInterventionType , {...getAuthConfig()});
        console.log(response)
        return response;
    } catch(e) {
        throw e;
    }
}

export const saveIntervention = async (newIntervention , role , userId) => {
    const startTime = `${newIntervention.startDate}T${newIntervention.startTime}`
    delete newIntervention.startDate;
    newIntervention.startTime = startTime;
    newIntervention.createdBy = userId;
    newIntervention.isSuperUser = role === "SUPERUSER"

    try{
        const response = await axios.post(`${backendServer}/api/intervention/createIntervention` , newIntervention , {...getAuthConfig()});
        console.log(response)
        return response;
    }catch (e) {
        throw e;
    }
}

//patch requests

export const updateSite = async (newSite , siteId) => {
    try {
        const response = await axios.patch(`${backendServer}/api/sites/updateSite/${siteId}` , newSite , {...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw e;
    }
}

export const updateInterventionType = async (interventionType , interventionTypeId) => {
    try {
        const response = await axios.patch(`${backendServer}/api/interventionType/updateIntervention/${interventionTypeId}` , interventionType , {...getAuthConfig()});
        console.log(response);
        return response;
    } catch (e) {
        throw e;
    }
}

export const updateIntervention = async (newIntervention , interventionId) => {
    const startTime = `${newIntervention.startDate}T${newIntervention.startTime}`
    delete newIntervention.startDate;
    newIntervention.startTime = startTime;
    try {
        const response = await axios.patch(`${backendServer}/api/intervention/updateIntervention/${interventionId}` , newIntervention ,{...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw e;
    }
}

export const updateSupervisor = async (supervisor , supervisorId) => {
    if(!supervisor.password) delete supervisor.password;
    try {
        const response = await axios.patch(`${backendServer}/api/users/updateSupervisor/${supervisorId}` , supervisor , {...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e){
        throw e;
    }
}


export const updateSuperuser = async (superuser , superUserId) => {
    if(!superuser.password) delete superuser.password;
    try {
        const response = await axios.patch(`${backendServer}/api/superuser/updateSuperuser/${superUserId}` , superuser , {...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e){
        throw e;
    }
}

export const updateTechnician = async (technician , technicianId) => {
    if(!technician.password) delete technician.password;
    console.log(technician);
    try {
        const response = await axios.patch(`${backendServer}/api/users/updateTechnician/${technicianId}` , technician , {...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw e;
    }
}


export const updatePatientById = async (patientId , values) => {
    try {
        const response = await axios.patch(`${apiGateway}/user-service/api/patient/updatePatientById/${patientId}` , values , {...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw e;
    }
}

export const updateDoctorById = async (doctorId , values) => {
    if(!values.password) delete technician.password;
    try {
        const response = await axios.patch(`${apiGateway}/user-service/api/doctor/updateDoctorById/${doctorId}` , values , {...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw e;
    }
}

export const updateManagerById = async (managerId , values) => {
    if(!values.password) delete values.password;
    try {
        const response = await axios.patch(`${apiGateway}/user-service/api/manager/updateManagerById/${managerId}` , values , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}


// delete requests

export const deleteInterventionType = async (interventionTypeId) => {
    try {
        const response = await axios.delete(`${backendServer}/api/interventionType/deleteInterventionType/${interventionTypeId}` ,{...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw e;
    }
}

export const deleteSite = async (siteId) => {
    try {
        const response = await axios.delete(`${backendServer}/api/sites/deleteSite/${siteId}` , {} ,{...getAuthConfig()});
        console.log(response);
        return response;
    }catch (e) {
        throw  e;
    }
}

export const deleteIntervention = async (interventionId) => {
    try {
        const response = await axios.delete(`${backendServer}/api/intervention/deleteIntervention/${interventionId}` , {...getAuthConfig()});
    }catch (e) {
        throw e;
    }
}

export const deleteSupervisor = async (supervisorId) => {
    try {
        const response = await axios.delete(`${backendServer}/api/users/deleteSupervisor/${supervisorId}` , {...getAuthConfig()});
    }catch (e) {
        throw e;
    }
}


export const deleteTechnician = async (technicianId) => {
    try {
        const response = await axios.delete(`${backendServer}/api/users/deleteTechnician/${technicianId}` , {...getAuthConfig()});
    }catch (e) {
        throw e;
    }
}


// get requests

export const getPatientsByDoctorId = async (doctorId) => {
    try {
        const response = await axios.get(`${apiGateway}/user-service/api/patients/getPatientsByDoctorId/${doctorId}`  ,  {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getPatientById = async (patientId) => {
    try {
        const response = await axios.get(`${apiGateway}/user-service/api/patient/getPatientById/${patientId}`  ,  {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getDoctorById = async (doctorId) => {
    try {
        const response = await axios.get(`${apiGateway}/user-service/api/doctor/getDoctorById/${doctorId}`  , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getManagerById = async (managerId) => {
    try {
        const response = await axios.get(`${apiGateway}/user-service/api/manager/getManagerById/${managerId}`  , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getSites = async () => {
    try {
        const response = await axios.get(`${backendServer}/api/sites/getSites` ,{...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getSite = async (siteId) => {
    try {
        const response = await axios.get(`${backendServer}/api/sites/getSiteById/${siteId}` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}


export const getInterventionById = async (interventionId) => {
    try {
        const response = await axios.get(`${backendServer}/api/intervention/${interventionId}` ,{...getAuthConfig()});
        return response;
    } catch (e) {
        throw e;
    }
}

export const getInterventionTypes = async () => {
    try {
        const response = await axios.get(`${backendServer}/api/interventionType/allInterventionTypes` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getInterventionTypeById = async (interventionTypeId) => {
    try{
        const response = await axios.get(`${backendServer}/api/interventionType/interventionType/${interventionTypeId}` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getCreatedUsers = async () => {
    try {
        const response = await axios.get(`${backendServer}/api/users/getAllCreatedUsers`);
        return response;
    }catch (e) {
        throw e;
    }
}

export const getInterventions = async (filters  , userId , role) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    });

    try {
        if(role === "SUPERVISOR" || role === "SUPERUSER")
            return await axios.get(`${backendServer}/api/intervention/getInterventions` , {params , ...getAuthConfig() });
        else if(role === "TECHNICIAN")
             return await axios.get(`${backendServer}/api/intervention/getInterventionsByUserId/${userId}` , {params  , ...getAuthConfig() });
    }catch (e) {
        throw e;
    }
}


export const getInterventionsChartStats = async (userId , role) => {
    const params = new URLSearchParams();
    if(!(role === "SUPERVISOR" || role === "SUPERUSER"))
        params.append("id" , userId);
    try {
        const response = await axios.get(`${backendServer}/api/intervention/getInterventionsChartData` , {params , ...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getSitesPie = async (userId = null) => {
    let params = new URLSearchParams();
    if(userId)
        params.append("id" , userId);
    try {
        const response = await axios.get(`${backendServer}/api/sites/getSitesPieStats` ,  {params , ...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getInterventionsStats = async (role , userId) => {
    const params = new URLSearchParams();
    params.append("role" , role);
    params.append("id" , userId);
    try {
        const response = await axios.get(`${backendServer}/api/intervention/getInterventionsStats` , {params , ...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getPatients = async (filters) => {
    console.log(filters);
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    });
    try {
        const response = await axios.get(`${apiGateway}/user-service/api/patient/getPatients` ,{params , ...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getPatientStats = async () => {
    try {
        const response = await axios.get(`${apiGateway}/user-service/api/patient/getPatientsStats` ,{...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}


export const getDoctors = async (filters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    });
    try {
        const response = await axios.get(`${apiGateway}/user-service/api/doctor/getDoctors` ,{params , ...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}




export const getSuperuser = async (superuserId) => {
    try {
        const response = await axios.get(`${backendServer}/api/superuser/getSuperuser/${superuserId}` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}



export const getTechnician = async (technicianId) => {
    try {
        const response = await axios.get(`${backendServer}/api/users/technician/${technicianId}` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getSupervisor = async (supervisorId) => {
    try {
        const response = await axios.get(`${backendServer}/api/users/supervisor/${supervisorId}` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getTechniciansSupervisors = async () => {
    try {
        const response = await axios.get(`${backendServer}/api/users/getUsersForIntervention` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getStatsForTechnician = async (technicianId) => {
    try{
        const response = await axios.get(`${backendServer}/api/users/getTechnicianStats/${technicianId}` ,{...getAuthConfig()});
        return response;
    }catch(e) {
        throw e;
    }
}

export const getUsersStats = async () => {
    try{
        const response = await axios.get(`${backendServer}/api/users/getUsersStats` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getStatsForSupervisor = async (supervisorId) => {
    try{
        const response = await axios.get(`${backendServer}/api/users/getSupervisorStats/${supervisorId}` , {...getAuthConfig()});
        return response;
    }catch(e) {
        throw e;
    }
}

export const getAllTechniciansAndSupervisors = async (filters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    });
    try{
        const response = await axios.get(`${backendServer}/api/users/getTechniciansSupervisors` , {params , ...getAuthConfig() })
        return response;
    }catch (e) {
        throw e;
    }
}

export const getUsers = async (role) => {
    try{
        if(role === "SUPERUSER" ) {
            return await getTechniciansSupervisors();
        } else if(role === "SUPERVISOR") {
            return await getTechnicians();
        }else{
            throw new Error("Invalid Role");
        }
    }catch (e) {
        throw e;
    }
}


export const getStatsForSuperuser = async (superuserId) => {
    try{
        const response = await axios.get(`${backendServer}/api/superuser/getSuperuserStats/${superuserId}` ,{...getAuthConfig()});
        return response;
    }catch(e) {
        throw e;
    }
}

export const getUserLatestInterventions = async (userId) => {
    try {
        const response = await axios.get(`${backendServer}/api/intervention/getUserLatestInterventions/${userId}` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getSuperuserLatestInterventions = async () => {
    try {
        const response = await axios.get(`${backendServer}/api/intervention/getSuperuserLatestInterventions` , {...getAuthConfig()});
        return response;
    }catch (e) {
        throw e;
    }
}

export const getHomePageData = async (userId, role) => {
    try {
        let statsFn, interventionsFn;

        switch (role) {
            case "SUPERUSER":
                statsFn = getStatsForSuperuser;
                interventionsFn = getSuperuserLatestInterventions;
                break;

            case "SUPERVISOR":
                statsFn = getStatsForSupervisor;
                interventionsFn = getSuperuserLatestInterventions;
                break;

            case "TECHNICIAN":
                statsFn = getStatsForTechnician;
                interventionsFn = getUserLatestInterventions;
                break;

            default:
                throw new Error("Invalid Role");
        }

        const [statsResponse, interventionsResponse] = await axios.all([
            statsFn(userId),
            interventionsFn(userId),
        ]);

        return {
            stats: statsResponse.data,
            interventions: interventionsResponse.data,
        };
    } catch (error) {
        throw error;
    }
};


export const getInterventionCreationData = async (role) => {
    try{
        if(role === "SUPERVISOR" || role === "SUPERUSER") {
            const [sitesResponse , techniciansResponse , interventionTypesResponse] = await axios.all([
                getSites(0 , 10000) , getTechniciansSupervisors() , getInterventionTypes()
            ]);
            return {sites : sitesResponse.data , technicians : techniciansResponse.data , interventionTypes : interventionTypesResponse.data}
        }else if(role === "TECHNICIAN") {
            const [sitesResponse  , interventionTypesResponse] = await axios.all([
                getSites(0 , 10000) , getInterventionTypes()
            ]);
            return {sites : sitesResponse.data , interventionTypes : interventionTypesResponse.data}
        }else {
            throw new Error("Invalid Role")
        }
    }catch (e) {
        throw e;
    }
}

export const getInterventionsToExport = async (role , filters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    });
    if(!(role === "SUPERVISOR" || role === "SUPERUSER")) throw new Error("Invalid role");
    try{
        const response = await axios.get(`${backendServer}/api/intervention/getInterventionsForExportation` , {params , ...getAuthConfig()})
        return response;
    }catch (e) {
        throw e;
    }
}


export const createExportation = async (newExportation) => {

    try{
        const response = await axios.post(`${backendServer}/api/exportation/createExportation` , newExportation , {...getAuthConfig()})
        return response;
    }catch (e) {
        throw e;
    }
}

export const getUserExportations = async (filters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    });

    if(!(filters.role === "SUPERVISOR" || filters.role === "SUPERUSER")) throw new Error("Invalid role");

    try{
        const response = await axios.get(`${backendServer}/api/exportation/getExportationsByUser`  , {params , ...getAuthConfig()})
        return response;
    }catch (e) {
        throw e;
    }

}













