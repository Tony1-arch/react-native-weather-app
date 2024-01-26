import { View, Text,SafeAreaView, TextInput, TouchableOpacity,KeyboardAvoidingView,ScrollView, Platform, Keyboard } from 'react-native';
import {MagnifyingGlassIcon} from 'react-native-heroicons/outline'
import {MapPinIcon,CalendarDaysIcon } from 'react-native-heroicons/solid'
import { Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';

import {debounce} from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import * as Progress from 'react-native-progress'
import { getData, storeData } from '../utils/asyncStorage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'



const HomeScreen = () => {
  const [showSearch , setShowSearch] = useState(false)
  
  const [locations, setLocations] = useState([])
  const [weather,setWeather] = useState({})
  const [loading, setLoading] = useState(true)

  const handleLocations = (loc)=>{
     console.log('location',loc)
     setLocations([]);
     setShowSearch(false)
     setLoading(true)

     fetchWeatherForecast({
       cityName: loc.name,
       days:'7'
     }).then(data =>{
      setWeather(data)
      setLoading(false)
     
      storeData('city',loc.name)
      console.log('got data:', data);
     })
  }
  const handleSearch = (value)=>{
    if(value.length > 2){
      fetchLocations({cityName:value}).then(data =>{
        console.log('got location:',data)
        setLocations(data)

      })
    }
  }
  useEffect(()=>{
    fetchMyWeatherData();

  },[]);
  const  fetchMyWeatherData = async() =>{
    let myCity = await getData('city')
    let cityName = 'kampala';
    if(myCity) cityName = myCity
    fetchWeatherForecast({
      cityName ,
      days: '7',
    }).then(data =>{
      setWeather(data);
      setLoading(false)
    })
  }
  const handleTextDebounce = useCallback(debounce(handleSearch,1200,),[])
  const  {current,location} = weather
  return (
    /* The line `<KeyboardAwareScrollView</KeyboardAwareScrollView>` is a closing tag for the
    `KeyboardAwareScrollView` component. However, it seems to be missing the closing angle bracket
    (`>`), so it is not a valid syntax. It should be corrected to
    `<KeyboardAwareScrollView></KeyboardAwareScrollView>` to properly close the component. */
    <KeyboardAvoidingView behavior={Platform.OS === 'ios'? "padding":'height' } enabled style={{flex:1,justifyContent:'center'}} >
    
    <ScrollView scrollEnabled={true} contentContainerStyle={{flexGrow:1}}
     className="flex-1 relative h-full bottom-0 top-0"  >
    
    <StatusBar style='light'/>
      <Image blurRadius={70} source={require('../assets/images/bg.png')} className='absolute h-full w-full'/>
      {
        loading?(
                   <View className='flex-1 flex-row justify-center items-center'>
                          <Progress.CircleSnail  thickness={10} size={160} color='#0bb3b2'/>
                   </View>
        ):(
          
          <SafeAreaView className=' flex flex-1 pt-10 '>
            <View style={{height:'7%'}} className='mx-4 relative z-50'>
        <View className='flex-row  mb-10  justify-end items-center rounded-full' style=     {{backgroundColor: showSearch? theme.bgWhite(0.2):'transparent'}}>
        {showSearch?(
          <TextInput
               onChangeText={handleTextDebounce}
               placeholder='Search City '
               placeholderTextColor={'lightgray'}
               className='pl-6 h-10 flex-1 text-base text-white'/>
                ):null
                }
           
              <TouchableOpacity 
                 onPress={() => setShowSearch(!showSearch)}
                 style={{backgroundColor:theme.bgWhite(0.3)}}
                 className='rounded-full p-3 m-1'
         >
            <MagnifyingGlassIcon  size='25' color='white'/>
         </TouchableOpacity>
        </View>
        {locations.length>0 && showSearch?(
          
          <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
           {locations.map((loc,index) =>{
            let showBorder = index+1 != locations.length;
            let borderClass = showBorder? ' border-b-gray-400 border-b-2':'';
            return(
              <TouchableOpacity 
              onPress={() => handleLocations(loc)}
               key={index} className={'flex-row items-center border-0 p-3 mb-1 '+borderClass} >
              <MapPinIcon size='20' color='gray'/>
                <Text className='text-black text-lg ml-2'>{loc?.name}, {loc?.country}</Text> 
              
              </TouchableOpacity>

            )
           })}
          </View>
          
        ):null}
        
          </View>
          
       
           {/*   forcastsection */}
            
           <View className="mx-4 justify-around flex-1 mb-2">
            {/* locations */}
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-lg  font-semibold text-gray-300 p-10">
              {'' + location?.country},
            </Text>
              </Text>
            <View className='flex-row justify-center'>
              <Image 
               source={weatherImages[current?.condition?.text]}
               className='w-24 h-20' 
              />
            </View>
           <View className='space-y-2'>
            <Text className='text-center font-bold text-white text-6xl ml-5'>
              {current?.temp_c}&#176;
            </Text>
            <Text className='text-center  text-white text-xl tracking-widest'>
            {current?.condition?.text}
            </Text>
           </View>
        {/*    other stats */}
        <View className="flex flex-row justify-between m-4">
        <View className='flex-row space-x-2 items-center'>
           <Image source={require('../assets/icons/wind.png')}
           className='h-6 w-6 '/>
           <Text className='font-semibold text-base text-white'>
            {current?.wind_kph}km
           </Text>
        </View>
        <View className='flex-row space-x-2 items-center'>
           <Image source={require('../assets/icons/drop.png')}
           className='h-6 w-6 '/>
           <Text className='font-semibold text-base text-white'>
           {current?.humidity}%
           </Text>
        </View>
        <View className='flex-row space-x-2 items-center'>
           <Image source={require('../assets/icons/sun.png')}
           className='h-6 w-6 '/>
           <Text className='font-semibold text-base text-white'>
           {weather?.forecast?.forecastday[0].astro?.sunrise }
           </Text>
        </View>
        </View>
        </View>
        <View className="mb-2 space-y-3">
          <View className='flex-row items-center mx-5 space-x-2'>
          <CalendarDaysIcon size='23'color='white'/>
           <Text className='text-white text-base p-3'>Daily Forecast</Text>
          </View>
        
            <ScrollView
          horizontal
          contentContainerStyle={{paddingHorizontal:15}}
          showsHorizontalScrollIndicator={false}
          >
          {weather?.forecast?.forecastday?.map((item, index) =>{
            let date = new Date(item?.date);
            let options = {weekday:'long'}
            let dayName = date.toLocaleDateString('en-us',options)
            dayName = dayName.split(',')[0]
          return(
          <View key={index} className='flex justify-center m-2 items-center w-24 rounded-3xl py-3 space-y-2'
           style={{backgroundColor: theme.bgWhite(0.15)}} >
           <Image source={weatherImages[item?.day?.condition?.text]}  className='h-7 w-7'/>  
           <Text className='text-white'>{dayName}</Text>  
           <Text className='text-white text-xl font-semibold'>{item?.day?.avgtemp_c}&#176;</Text>  
           </View>
           )
          } ) }
        
          </ScrollView>
        
          
        </View>
        
         
        </SafeAreaView>
        
            
          
      
        )
      }
   
     
    </ScrollView>
    </KeyboardAvoidingView>
  
  )
}

export default HomeScreen