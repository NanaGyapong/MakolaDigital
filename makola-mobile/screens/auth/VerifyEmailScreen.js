
import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";
import { authService } from "../../lib/auth";
import { useAuthStore } from "../../lib/store";

export default function VerifyEmailScreen({ navigation, route }) {
  const email = route.params?.email || "";
  const setUser = useAuthStore(s => s.setUser);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const refs = Array.from({length:6}, () => useRef(null));

  const handleChange = (i, v) => {
    if(!/^\d?$/.test(v)) return;
    const n=[...otp]; n[i]=v; setOtp(n);
    if(v && i<5) refs[i+1].current?.focus();
  };

  const verify = async () => {
    const code = otp.join("");
    if(code.length<6){Alert.alert("Error","Enter the full 6-digit code");return;}
    setLoading(true);
    try { const user = await authService.verifyEmail(email, code); setUser(user); }
    catch(err){Alert.alert("Error",err.message||"Invalid code");}
    finally{setLoading(false);}
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <View style={{padding:spacing.xl}}>
        <Text style={{fontSize:48,textAlign:"center",marginBottom:20}}>📧</Text>
        <Text style={{fontSize:24,fontWeight:"900",color:colors.text,textAlign:"center",marginBottom:8,letterSpacing:-0.6}}>Check your email</Text>
        <Text style={{color:colors.textMuted,textAlign:"center",fontSize:14,marginBottom:32,lineHeight:20}}>We sent a 6-digit code to{"
"}<Text style={{color:colors.text,fontWeight:"700"}}>{email}</Text></Text>
        <View style={{flexDirection:"row",gap:10,justifyContent:"center",marginBottom:32}}>
          {otp.map((d,i)=>(
            <TextInput key={i} ref={refs[i]} style={{width:46,height:52,textAlign:"center",fontSize:20,fontWeight:"900",backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1.5,borderColor:d?colors.red:colors.border,borderRadius:12,color:colors.text}} maxLength={1} value={d} onChangeText={v=>handleChange(i,v)} keyboardType="numeric" />
          ))}
        </View>
        <TouchableOpacity onPress={verify} disabled={loading} style={{backgroundColor:colors.red,borderRadius:14,paddingVertical:15,alignItems:"center",opacity:loading?0.6:1}}>
          {loading?<ActivityIndicator color="#fff"/>:<Text style={{color:"#fff",fontSize:16,fontWeight:"900"}}>Verify email →</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
