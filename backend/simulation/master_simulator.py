from abc import ABC, abstractmethod

class StateDefinition:
    def __init__(self, key, value):
        self.definition = {"key": key, "label": value}
    def get(self):
        return self.definition
    
    @staticmethod
    def equals (s1, s2):
        return s1.definition['key'] == s2.definition['key']

class TrackState:
    def __init__(self):
        self.HIGH_SPEED = StateDefinition("high_speed", "High-Speed Straight (e.g., Monza)")
        self.TECHNICAL = StateDefinition("technical", "Technical/Street (e.g., Monaco)")
        self.HIGH_G_LATERAL = StateDefinition("high_g_lateral", "High-G Lateral (e.g., Silverstone)")
        self.STREET_CIRCUIT =StateDefinition( "street_circuit","Street Circuit (e.g., Monaco)")
        self.HIGH_ALTITUDE = StateDefinition("high_altitude","High-Altitude (e.g., Mexico City)")
        self.SEA_LEVEL = StateDefinition("sea_level","Sea-Level (e.g., Monza)")
        self.HIGH_RECOVERY = StateDefinition("high_recovery","High-Recovery (e.g., Spa)")
        self.LOW_RECOVERY = StateDefinition("low_recovery","Low-Recovery (e.g., Monza)")
        self.HIGH_LOAD_LATERAL = StateDefinition("high_load_lateral","High-Load Lateral (e.g., Silverstone)")
        self.HEAVY_BRAKING = StateDefinition("heavy_braking","Heavy Braking (e.g., Montreal)")
        self.FLOWING_CIRCUIT = StateDefinition("flowing_circuit","Flowing Circuit (e.g., Silverstone)")
        self.BUMPY = StateDefinition("bumpy","Bumpy/High-Kerb (e.g., Montreal)")
        self.SMOOTH = StateDefinition("smooth","Smooth Permanent (e.g., Barcelona)")
        self.ALL = StateDefinition("all","All Circuits")

class Weather:
    def __init__(self):
        self.DRY =StateDefinition("dry","Hot track")
        self.WET=StateDefinition("wet","Heavy Rain")

class Setup:
    def __init__(self):
        self.HIGHDOWNFORCE=StateDefinition("high_downforce","High Downforce")
        self.LOWDRAG=StateDefinition("low_drag","Low Drag")
        self.BALANCED= StateDefinition("balanced","Balenced")


class Simulator(ABC):

    @abstractmethod
    def simulate(self, track_state: StateDefinition, weather_state: StateDefinition, setup: StateDefinition):
        pass