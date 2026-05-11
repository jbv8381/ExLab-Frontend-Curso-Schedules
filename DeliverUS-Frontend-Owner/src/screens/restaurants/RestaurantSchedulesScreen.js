/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'

import { getRestaurantSchedules, removeSchedule } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import DeleteModal from '../../components/DeleteModal'
import scheduleIcon from '../../../assets/schedule.png'

export default function RestaurantSchedulesScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [schedules, setSchedules] = useState([])
  const [scheduleToBeDeleted, setScheduleToBeDeleted] = useState(null)
  

  useEffect(() => {
    if (loggedInUser) {
      fetchSchedules()
    } else {
      setSchedules([])
    }
  }, [loggedInUser, route])

  const renderSchedule = ({ item }) => {
    return (
      <ImageCard
        imageUri={scheduleIcon}
        title={item.name}
      >
        
        <TextRegular numberOfLines={1}>
          <TextSemiBold textStyle={styles.price}>Start Time: </TextSemiBold>
          <TextRegular textStyle={{color: GlobalStyles.brandGreen}}>{item.startTime}</TextRegular>             
        </TextRegular>

        <TextRegular numberOfLines={1}>
          <TextSemiBold textStyle={styles.price}>End Time: </TextSemiBold>
          <TextRegular textStyle={{color: GlobalStyles.brandPrimary}}>{item.endTime}</TextRegular>             
        </TextRegular>

        <TextSemiBold textStyle={styles.availability }>{item.products.length} products associated</TextSemiBold>   
        
              <View style={styles.actionButtonsContainer}>
              <Pressable
                onPress={() => navigation.navigate('EditScheduleScreen', { restaurantId: route.params.id, id: item.id, schedule: item })
                }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandBlueTap
                      : GlobalStyles.brandBlue
                  },
                  styles.actionButton
                ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
                <TextRegular textStyle={styles.text}>
                  Edit
                </TextRegular>
              </View>
            </Pressable>
    
            <Pressable
                onPress={() => { setScheduleToBeDeleted(item) }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandPrimaryTap
                      : GlobalStyles.brandPrimary
                  },
                  styles.actionButton
                ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
                <TextRegular textStyle={styles.text}>
                  Delete
                </TextRegular>
              </View>
            </Pressable>
            </View>
          </ImageCard>
        )
  }

  const renderEmptySchedulesList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No schedules were retreived. Either you are not logged in or the restaurant has no schedules yet.
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <>
      {loggedInUser &&
      <Pressable
        onPress={() => navigation.navigate('CreateScheduleScreen', { id: route.params.id })
        }
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandGreenTap
              : GlobalStyles.brandGreen
          },
          styles.button
        ]}>
        <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name='plus-circle' color={'white'} size={20}/>
          <TextRegular textStyle={styles.text}>
            Create schedule
          </TextRegular>
        </View>
      </Pressable>
    }
    </>
    )
  }

  const fetchSchedules = async () => {
    try {
      const fetchedSchedules = await getRestaurantSchedules(route.params.id)
      setSchedules(fetchedSchedules)
    } catch (error) {
      showMessage({
        message: 'Error fetching restaurant schedules',
        description: error.message,
        type: 'danger'
      })
    }
  }

  const remove = async (schedule) => {
    try {
      await removeSchedule(route.params.id, schedule.id)
      showMessage({
        message: 'Schedule removed',
        type: 'success'
      })
      fetchSchedules()
    } catch (error) {
      showMessage({
        message: 'Error removing schedule',
        description: error.message,
        type: 'danger'
      })
    }
  }

  return (
    <View>
      <FlatList
        style={styles.container}
        data={schedules}
        renderItem={renderSchedule}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptySchedulesList}
      />
      <DeleteModal
        isVisible={scheduleToBeDeleted !== null}
        onCancel={() => setScheduleToBeDeleted(null)}
        onConfirm={() => remove(scheduleToBeDeleted)}>
      </DeleteModal>
    </View>
  )
}

const styles = StyleSheet.create({
  availability: {
      textAlign: 'right',
      marginRight: 5,
      color: GlobalStyles.brandSecondary
    },
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  productsAssociatedText: {
    textAlign: 'right',
    color: GlobalStyles.brandSecondary
  }
})
