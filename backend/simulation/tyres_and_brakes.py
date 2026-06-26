from dataclasses import dataclass, asdict
from simulation.master_simulator import Simulator,TrackState,Weather,Setup,StateDefinition
import random


@dataclass
class TyresAndBrakesData:
    tyre_core_temperature : float
    tyre_surface_temperature : float
    tyre_pressure : float
    brake_disc_temperature : float
    brake_fluid_temperature : float

    def __dict__(self):
        return asdict(self)

class TyresAndBrake(Simulator):
    track_state:TrackState
    weather_state : Weather
    setup : Setup

    def __init__(self):
        self.values = TyresAndBrakesData(0,0,0,0,0)
        self.track_state = TrackState()
        self.weather_state =Weather()
        self.setup = Setup()

        def __dict__(self):
            return asdict(self)

    def simulate(self, track_state : StateDefinition, weather_state : StateDefinition, setup : StateDefinition):
        tyre_core_temperature = random.uniform(72,96)
        tyre_surface_temperature = random.uniform(68,98.5)
        tyre_pressure = random.uniform(20.5,24.9)
        brake_disc_temperature = random.uniform(335,1000)
        brake_fluid_temperature = random.uniform(20,105)
        self.values = TyresAndBrakesData(tyre_core_temperature,tyre_surface_temperature,tyre_pressure,brake_disc_temperature,brake_fluid_temperature)
        if StateDefinition.equals(track_state,self.track_state.HIGH_LOAD_LATERAL):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    tyre_core_temperature = random.uniform(95,115)
                    tyre_surface_temperature = random.uniform(100,130)
                    tyre_pressure = random.uniform(21.5,26.5)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    tyre_core_temperature = random.uniform(90,110)
                    tyre_surface_temperature = random.uniform(95,120)
                    tyre_pressure = random.uniform(21,25.5)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    tyre_core_temperature = random.uniform(92,112)
                    tyre_surface_temperature = random.uniform(98,125)
                    tyre_pressure = random.uniform(21.2,26)
        elif StateDefinition.equals(track_state,self.track_state.STREET_CIRCUIT):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    tyre_core_temperature = random.uniform(55,82)
                    tyre_surface_temperature = random.uniform(40,70)
                    tyre_pressure = random.uniform(20,24)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    tyre_core_temperature = random.uniform(50,78)
                    tyre_surface_temperature = random.uniform(35,65)
                    tyre_pressure = random.uniform(19.5,23.5)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    tyre_core_temperature = random.uniform(52,80)
                    tyre_surface_temperature = random.uniform(38,68)
                    tyre_pressure = random.uniform(19.8,23.8)
        elif StateDefinition.equals(track_state,self.track_state.HEAVY_BRAKING):
            if StateDefinition.equals(weather_state,self.weather_state.DRY):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    brake_disc_temperature = random.uniform(450,1200)
                    brake_fluid_temperature = random.uniform(30,120)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    brake_disc_temperature = random.uniform(480,1250)
                    brake_fluid_temperature = random.uniform(25,115)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    brake_disc_temperature = random.uniform(460,1220)
                    brake_fluid_temperature = random.uniform(28,118)
        elif StateDefinition.equals(track_state,self.track_state.FLOWING_CIRCUIT):
            if StateDefinition.equals(weather_state,self.weather_state.WET):
                if StateDefinition.equals(setup,self.setup.HIGHDOWNFORCE):
                    brake_disc_temperature = random.uniform(200,750)
                    brake_fluid_temperature = random.uniform(15,95)
                elif StateDefinition.equals(setup,self.setup.LOWDRAG):
                    brake_disc_temperature = random.uniform(220,800)
                    brake_fluid_temperature = random.uniform(10,90)
                elif StateDefinition.equals(setup,self.setup.BALANCED):
                    brake_disc_temperature = random.uniform(210,780)
                    brake_fluid_temperature = random.uniform(12,92)

        return self.values


            
        




