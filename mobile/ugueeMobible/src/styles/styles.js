// styles/styles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const dynamicFontSize = SCREEN_WIDTH * 0.06;

export default StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
  },
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
  },
  logo: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.3,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  logoSmall: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.25,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  homeImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.35,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#666',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  primaryButton: {
    backgroundColor: '#AA00FF',
    width: '80%',
    paddingVertical: SCREEN_HEIGHT * 0.018,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  primaryButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.045,
  },
  secondaryButton: {
    backgroundColor: '#7150B0',
    width: '80%',
    paddingVertical: SCREEN_HEIGHT * 0.018,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.015,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.045,
  },
  helpButton: {
    marginTop: SCREEN_HEIGHT * 0.03,
    padding: 10,
  },
  helpText: {
    fontFamily: 'Poppins-Regular',
    color: '#444',
    textDecorationLine: 'underline',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    backgroundColor: '#F6F4F4',
    borderRadius: 25,
    marginBottom: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
  },
  icon: {
    marginRight: SCREEN_WIDTH * 0.02,
  },
  input: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.06,
    fontFamily: 'Poppins-Regular',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  errorText: {
    color: 'red',
    fontFamily: 'Poppins-Regular',
    marginBottom: SCREEN_HEIGHT * 0.015,
    fontSize: SCREEN_WIDTH * 0.035,
  },
});
