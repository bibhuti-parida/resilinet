"""Geospatial helpers for merging repeated distress broadcasts."""

import math


def haversine_meters(latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float) -> float:
    """Return the great-circle distance between two WGS-84 coordinates in meters."""
    earth_radius_meters = 6_371_000.0
    latitude_delta = math.radians(latitude_b - latitude_a)
    longitude_delta = math.radians(longitude_b - longitude_a)
    a = (
        math.sin(latitude_delta / 2) ** 2
        + math.cos(math.radians(latitude_a))
        * math.cos(math.radians(latitude_b))
        * math.sin(longitude_delta / 2) ** 2
    )
    return earth_radius_meters * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
