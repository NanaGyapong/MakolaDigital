
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";
import { authService } from "../../lib/auth";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if(!email){Alert.alert("Error","Enter your email");return;}
    setLoading(true);
    try { await authService.forgotPassword(email); setSent(true); }
    catch(err){Alert.alert("Error",err.message);}
    finally{setLoading(false);}
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <View style={{padding:spacing.xl}}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={{marginBottom:spacing.xl}}><Text style={{color:colors.textMuted}}>← Back</Text></TouchableOpacity>
        {sent ? (
          <View style={{alignItems:"center",paddingTop:40}}>
            <Text style={{fontSize:56,marginBottom:20}}>📬</Text>
            <Text style={{fontSize:22,fontWeight:"900",color:colors.text,marginBottom:10,letterSpacing:-0.5}}>Check your email!</Text>
            <Text style={{color:colors.textMuted,textAlign:"center",lineHeight:22}}>We sent a reset link to {email}. Expires in 30 minutes.</Text>
            <TouchableOpacity onPress={()=>navigation.navigate("Login")} style={{backgroundColor:colors.red,borderRadius:14,paddingVertical:14,paddingHorizontal:32,marginTop:32}}>
              <Text style={{color:"#fff",fontWeight:"900",fontSize:15}}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={{fontSize:26,fontWeight:"900",color:colors.text,marginBottom:8,letterSpacing:-0.6}}>Forgot password? 🔑</Text>
            <Text style={{color:colors.textMuted,marginBottom:28,fontSize:14,lineHeight:20}}>Enter your email and we will send you a reset link.</Text>
            <Text style={{fontSize:11,fontWeight:"700",color:colors.textMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:7}}>Email</Text>
            <TextInput style={{backgroundColor:"rgba(255,255,255,0.05)",borderWidth:1,borderColor:colors.border,borderRadius:12,padding:13,color:colors.text,fontSize:14,marginBottom:24}} placeholder="you@example.com" placeholderTextColor={colors.textDim} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TouchableOpacity onPress={submit} disabled={loading} style={{backgroundColor:colors.red,borderRadius:14,paddingVertical:15,alignItems:"center",opacity:loading?0.6:1}}>
              {loading?<ActivityIndicator color="#fff"/>:<Text style={{color:"#fff",fontSize:16,fontWeight:"900"}}>Send reset link →</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
