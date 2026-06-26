import sys
import os

from abc import ABC, abstractmethod

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIMULATION_DIR = os.path.join(ROOT_DIR, "simulation")
if SIMULATION_DIR not in sys.path:
    sys.path.append(SIMULATION_DIR)


from simulation.powerunit import PowerUnit
from simulation.tyres_and_brakes import TyresAndBrake
from simulation.chassis_dynamics_and_aero import ChassisDynamicsAndAero





#Product
class Car:
    def __init__(self):
        self.powerunit: PowerUnit = None
        self.tyres_adnd_brakes: TyresAndBrake = None
        self.chassis: ChassisDynamicsAndAero = None
    
    def simulate(self, track_state, weather, setup):
        powerunit_data = self.powerunit.simulate(track_state=track_state, weather_state=weather, setup=setup)
        tyres_and_brake_data = self.tyres_and_brakes.simulate(track_state=track_state, weather_state=weather, setup=setup)
        chassis_data = self.chassis.simulate(track_state=track_state, weather_state=weather, setup=setup)

        simulation_params = {
            "powerunit": powerunit_data.__dict__(),
            "tyres_and_brakes": tyres_and_brake_data.__dict__(),
            "chassis": chassis_data.__dict__()
        }
        return simulation_params

#Abstract Builder
class CarBuilder (ABC):

    @abstractmethod
    def reset (self):
        pass
    
    @abstractmethod
    def set_power_unit(self, powerunit: PowerUnit):
        pass

    @abstractmethod
    def set_tyres_and_brakes(self, tyres_and_brakes: TyresAndBrake):
        pass
    
    def set_chassis (self, chassis: ChassisDynamicsAndAero):
        pass
#Concrete Builder
class ConcreteCarBuilder(CarBuilder):

    def __init__(self):
        self.reset()

    def reset(self):
        self._car = Car()

    def set_power_unit(self, powerunit):
        self._car.powerunit = powerunit
        return self
    
    def set_tyres_and_brakes(self, tyres_and_brakes):
        self._car.tyres_and_brakes = tyres_and_brakes
        return self
    
    def set_chassis(self, chassis):
        self._car.chassis = chassis

    def get_product(self) -> Car:
        product = self._car
        self.reset()
        return product

class Director:
    builder: ConcreteCarBuilder
    def __init__(self):
        self.builder = None
    def build_formula_one(self):
        powerunit = PowerUnit()
        tyres_and_brakes = TyresAndBrake()
        chassis = ChassisDynamicsAndAero()
        self.builder.set_power_unit(powerunit=powerunit)
        self.builder.set_tyres_and_brakes(tyres_and_brakes=tyres_and_brakes)
        self.builder.set_chassis(chassis=chassis)




# track_state = TrackState()
# weather = Weather()
# state = Setup()

# director = Director()
# builder = ConcreteCarBuilder()
# director.builder = builder
# director.build_formula_one()
# product = builder.get_product()

# print(product.simulate(track_state.HIGH_SPEED, weather.DRY, state.BALANCED))