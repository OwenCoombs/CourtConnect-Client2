import axios from 'axios'

const baseUrl = "https://courtconnect-server.fly.dev"

export const getToken = async ({ setAccessToken, username, password }) => {
  try {
    const response = await axios.post(`${baseUrl}/token/`, {
      username: username,
      password: password
    });

    console.log('RESPONSE: ', response);
    console.log("WHAT THE ACCESS TOKEN RESPONSE LOOKS LIKE", response)
    setAccessToken(response.data.access);

    return response.data.access; // Return the access token
  } catch (error) {
    console.error('ERROR: ', error);
    setAccessToken(undefined);
    throw error; // Throw the error to handle it in the caller function
  }
};

export const fetchUser = async ({ token, liveProfile, auth }) => {
  console.log("DIS DE AUTH", token);
  
  try {
    const response = await axios.get(`${baseUrl}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Assuming the response data has a 'user' field
    const user = response.data;
    liveProfile.setProfile(user);
    console.log('User: ', user);
  } catch (error) {
    console.log('ERROR: ', error);
    auth.setAccessToken(undefined);
  }
};

export const createUser = ({ username, password, firstName, lastName }) => {
  axios({
    method: 'post',
    url: `${baseUrl}/create-user/`, 
    data: {
      username,
      password: password,
      first_name: firstName,
      last_name: lastName
    }
  }).then(response => {
    console.log('CREATE USER: ', response)
  })
  .catch(error => {
    console.log('ERROR: ', error)
  })
}

export const getImages = ({ auth }) => {
  return axios({
    method: 'get', 
    url: `${baseUrl}/get-user-images/`,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    }
  })
}


export const createImage = ({ auth, image }) => {
  const formData = new FormData();
  formData.append('image', image);

  return axios.post(`${baseUrl}/create-image/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });
};


export const getCourts = ({ auth }) => {
  return axios({
      method: 'get',
      url: `${baseUrl}/get-court`,
      headers: {
          Authorization: `Bearer ${auth.accessToken}`
      }
  }).then(response => {
      console.log('Courts: ', response.data); // Add logging
      return response.data; // Return the data directly
  }).catch(error => {
      console.log('ERROR: ', error);
      throw error; // Re-throw the error to be caught by the caller
  });
}


export const getActiveUsers = async ({ auth }) => {
  try {
    const response = await axios.get(`${baseUrl}/get-active-users`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`
      }
    });

    console.log('Active Users: ', response.data);
    return response.data; // Return the active users data
  } catch (error) {
    console.log('ERROR: ', error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

export const setActiveUser = async ({ auth, courtId, setActive }) => {
  const url = 'https://courtconnect-server.fly.dev/set-active-user';
  const data = {
      court_id: courtId,
      active: setActive  // Ensure the active status is sent
  };
  console.log('Request data:', data);

  try {
      const response = await axios.post(url, data, {
          headers: {
              Authorization: `Bearer ${auth.accessToken}`
          }
      });
      console.log('Response from setActiveUser:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error from setActiveUser:', error.response ? error.response.data : error.message);
      throw error;
  }
};


