import axios from 'axios'
import { apiKey } from '../constants';

const forecastEndpoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}`;

const locationEndpoint = params => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async(endpoint)=>{
      const options ={
            method:'GET',
            url:endpoint
      }
      try{
        const  resp = await axios.request(options);
        return resp.data;
      }catch(error){
            console.log(error)
            return null;
      }
}

export const fetchWeatherForecast = params =>{
      return apiCall(forecastEndpoint(params));
}

export const fetchLocations = params =>{
      return apiCall(locationEndpoint(params))
}