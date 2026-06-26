from simulation.master_simulator import Simulator,TrackState,Setup,Weather,StateDefinition
from dataclasses import dataclass, asdict
import random

@dataclass
class ChassisDynamicsAndAeroData:
    lvdt : float
    wheel_speed_sensors : float
    g_force_longitudnal : float
    g_force_lateral : float
    steering_angle : float
    throttle_position : float
    brake_position : float
    pilot_air_tube : float
    ride_height : float

    def __dict__(self):
        return asdict(self)

class ChassisDynamicsAndAero(Simulator):
    track_state : TrackState
    weather_state : Weather
    setup : Setup
    def __init__(self):
        self.values = ChassisDynamicsAndAeroData(0,0,0,0,0,0,0,0,0)
        self.weather_state = Weather()
        self.track_state = TrackState()
        self.setup =Setup()

    def simulate(self, track_state : StateDefinition, weather_state : StateDefinition, setup : StateDefinition):
        lvdt = random.uniform(-7.5,31)
        wheel_speed_sensors = random.uniform(60,309)
        g_force_longitudnal = random.uniform(-4.1,2.85)
        g_force_lateral = random.uniform(-3.9,3.9)
        steering_angle = random.uniform (-195,195)
        throttle_position = random.uniform(0,100)
        brake_position = random.uniform(0,100)
        pilot_air_tube = random.uniform(0,321.5)
        ride_height = random.uniform(27,90)
        self.values = ChassisDynamicsAndAeroData(lvdt,wheel_speed_sensors,g_force_longitudnal,g_force_lateral,steering_angle,throttle_position,brake_position,pilot_air_tube,ride_height)

        if StateDefinition.equals(track_state,self.track_state.BUMPY):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    lvdt=random.uniform(-15,45)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    lvdt=random.uniform(-10,35)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    lvdt=random.uniform(-12,40)
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    ride_height=random.uniform(35,95)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    ride_height=random.uniform(40,105)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    ride_height=random.uniform(38,100)
        elif StateDefinition.equals(track_state,self.track_state.SMOOTH):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    lvdt=random.uniform(-5,25)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    lvdt=random.uniform(-2,20)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    lvdt=random.uniform(-3,22)
            elif StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    ride_height=random.uniform(15,75)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    ride_height=random.uniform(18,85)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    ride_height=random.uniform(16,80)
        elif StateDefinition.equals(track_state,self.track_state.HIGH_SPEED):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    wheel_speed_sensors = random.uniform(80,360)
                    pilot_air_tube = random.uniform(0,370)
                if StateDefinition.equals(setup,self.setup.LOWDRAG):
                    wheel_speed_sensors = random.uniform(80,380)
                    pilot_air_tube = random.uniform(0,395)
                if StateDefinition.equals(setup,self.setup.BALANCED):
                    wheel_speed_sensors = random.uniform(80,370)
                    pilot_air_tube = random.uniform(0,385)
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                steering_angle = random.uniform(-30,30)
        elif StateDefinition.equals(track_state,self.track_state.TECHNICAL):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    wheel_speed_sensors = random.uniform(40,240)
                    g_force_longitudnal = random.uniform(-3,2.2)
                    pilot_air_tube = random.uniform(0,250)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    wheel_speed_sensors = random.uniform(40,255)
                    g_force_longitudnal = random.uniform(-2.8,2.2)
                    pilot_air_tube = random.uniform(0,265)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    wheel_speed_sensors = random.uniform(40,248)
                    g_force_longitudnal = random.uniform(-3,2.1)
                    pilot_air_tube = random.uniform(0,248)
        elif StateDefinition.equals(track_state,self.track_state.HEAVY_BRAKING):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    g_force_longitudnal=random.uniform(-5.5,3.5)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    g_force_longitudnal=random.uniform(-5,3.8)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    g_force_longitudnal=random.uniform(-5.2,3.6)
        elif StateDefinition.equals(track_state,self.track_state.STREET_CIRCUIT):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    g_force_lateral = random.uniform(-2.8,2.8)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    g_force_lateral = random.uniform(-2.4,2.4)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    g_force_lateral = random.uniform(-2.6,2.6)
            elif StateDefinition.equals(weather_state,self.weather_state.DRY):
                steering_angle = random.uniform(-360,360)
        elif StateDefinition.equals(track_state,self.track_state.ALL):
            throttle_position = random.uniform(0,100)
        return self.values

    
            


        
                    
                     
                

        