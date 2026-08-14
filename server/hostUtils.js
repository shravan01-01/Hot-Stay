function getHostedPropertiesForUser(hotels, userEmail) {
  if (!Array.isArray(hotels)) {
    return [];
  }

  return hotels.filter((hotel) => {
    const hotelHostEmail = hotel && typeof hotel.hostEmail === 'string'
      ? hotel.hostEmail.trim().toLowerCase()
      : '';
    const normalizedUserEmail = typeof userEmail === 'string'
      ? userEmail.trim().toLowerCase()
      : '';

    return hotelHostEmail && normalizedUserEmail && hotelHostEmail === normalizedUserEmail;
  });
}

module.exports = {
  getHostedPropertiesForUser
};
