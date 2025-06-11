import React from "react";
import {Text,View,StyleSheet} from "react-native";

const Title = ()=>{
    return(
        <View style={styles.header}>
            <Text style={styles.titleFirstLetter}>U</Text><Text style={styles.title}>güee</Text>
        </View>
    );
}
//{flexDirection:"row", justifyContent:"center", alignItems:"center"}

styles= StyleSheet.create({
    title: {
        fontSize: 90,
        color: "#AA00FF",
        fontWeight: "bold"
    },
    titleFirstLetter: {
        fontSize: 90,
        color: "black+",
        fontWeight: "bold"
    },
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
    
});

export default Title;