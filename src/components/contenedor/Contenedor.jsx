import { NativeBaseProvider, View } from "native-base";

export const Contenedor = ({children}) => {
    return <NativeBaseProvider>
        <View flex={1}>
            {children}
        </View>
    </NativeBaseProvider>
}