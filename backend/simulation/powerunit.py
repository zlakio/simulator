from dataclasses import dataclass, asdict
from simulation.master_simulator import Simulator, TrackState, Weather, Setup, StateDefinition
import random

@dataclass
class PowerUnitData:
    engine_rpm: int
    oil_pressure: float
    oil_temperature: float
    coolant_temperature: float
    mguk_soc: float
    mguh_speed: int
    fuel_flow_rate: float

    def __dict__(self):
        return asdict(self)

class PowerUnit (Simulator):
    track_state: TrackState
    weather_state: Weather
    setup: Setup

    def __init__(self):
        self.values = PowerUnitData(engine_rpm=0,
                                    oil_pressure=0,
                                    oil_temperature=0,
                                    coolant_temperature=0,
                                    mguk_soc=0,
                                    mguh_speed=0,
                                    fuel_flow_rate=0)
        self.track_state = TrackState()
        self.weather_state = Weather()
        self.setup = Setup()
    
    def simulate(self, track_state: StateDefinition, weather_state: StateDefinition, setup: StateDefinition):
        rpm = random.uniform(7900, 14325) 
        oil_pressure = random.uniform(2.4,5.25)
        oil_temperature = random.uniform(89.00, 114.00)
        coolant_temperature = random.uniform(81.5, 100.5)
        mguk_soc = random.uniform(6.00, 95.50)
        mguh_speed = random.uniform(25000.00, 113500.00)
        fuel_flow_rate = random.uniform(62, 95.50)
        self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)

        if StateDefinition.equals(track_state, self.track_state.HIGH_SPEED):
            if StateDefinition.equals(weather_state, self.weather_state.DRY):
                if StateDefinition.equals(setup, self.setup.HIGHDOWNFORCE):
                    rpm = random.uniform(11500.00, 15000.00)
                    mguh_speed = random.uniform(50000,125000)
                    fuel_flow_rate=random.uniform(85.00,100.00)
                    self.values.engine_rpm = rpm
                    self.values.mguh_speed=mguh_speed
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    rpm = random.uniform(12000.00, 15000.00)
                    mguh_speed = random.uniform(55000.00, 125000.00)
                    fuel_flow_rate = random.uniform(88, 100.00)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    rpm = random.uniform(11800.00, 15000.00)
                    mguh_speed = random.uniform(52000.00, 125000.00)
                    fuel_flow_rate = random.uniform(86, 100.00)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)

        elif StateDefinition.equals(track_state, self.track_state.TECHNICAL):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    rpm = random.uniform(4000.00, 13800.00)
                    mguh_speed = random.uniform(0,105000)
                    fuel_flow_rate=random.uniform(40.00,92.00)
                    self.values.engine_rpm = rpm
                    self.values.mguh_speed=mguh_speed
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    rpm = random.uniform(4000.00, 13500.00)
                    mguh_speed = random.uniform(0.00, 100000.00)
                    fuel_flow_rate = random.uniform(35.00, 90.00)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    rpm = random.uniform(4000.00, 13650.00)
                    mguh_speed = random.uniform(0.00, 102000.00)
                    fuel_flow_rate = random.uniform(38, 91.00)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
        elif StateDefinition.equals(track_state,self.track_state.HIGH_G_LATERAL):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    oil_pressure=random.uniform(2.8,5.5)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    oil_pressure=random.uniform(2.6,5.5)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    oil_pressure=random.uniform(2.7,5.5)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
        
        
        elif StateDefinition.equals(track_state,self.track_state.STREET_CIRCUIT):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    oil_pressure=random.uniform(2.2,5)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    oil_pressure=random.uniform(2,5)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    oil_pressure=random.uniform(2.1,5)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)

        elif StateDefinition.equals(track_state,self.track_state.HIGH_ALTITUDE):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    oil_temperature = random.uniform(100.00,125.00)
                    coolant_temperature=random.uniform(95,100.00)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    oil_temperature = random.uniform(98.00,122.00)
                    coolant_temperature=random.uniform(92,108.00)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    oil_temperature = random.uniform(99.00,124.00)
                    coolant_temperature=random.uniform(94,110.00)
                    self.values = PowerUnitData(rpm, oil_pressure, oil_temperature, coolant_temperature, mguk_soc, mguh_speed, fuel_flow_rate)
        elif StateDefinition.equals(track_state,self.track_state.SEA_LEVEL):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    oil_pressure=random.uniform(2.2,5)
                    oil_temperature=random.uniform(80,105)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    oil_pressure=random.uniform(2,5)
                    oil_temperature=random.uniform(78,102)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    oil_pressure=random.uniform(2.2,5)
                    oil_temperature=random.uniform(80,105)
        elif StateDefinition.equals(track_state,self.track_state.HIGH_RECOVERY):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    mguk_soc=random.uniform(10,100)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    mguk_soc=random.uniform(10,100)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    mguk_soc=random.uniform(10,100)

        elif StateDefinition.equals(track_state,self.track_state.LOW_RECOVERY):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    mguh_speed=random.uniform(2,95)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    mguh_speed=random.uniform(2,95)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    mguh_speed=random.uniform(2,95)
        
        return self.values
                


            

            