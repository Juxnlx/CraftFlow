import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { COLORS } from "../../config/theme";
import { Ionicons } from "@expo/vector-icons";

// Pantallas principales
import { HomeScreen } from "../../app/views/home/HomeScreen";
import { ExploreScreen } from "../../app/views/explore/ExploreScreen";
import { InventoryScreen } from "../../app/views/inventory/InventoryScreen";
import { SavedScreen } from "../../app/views/saved/SavedScreen";
import { ProfileScreen } from "../../app/views/profile/ProfileScreen";

// Subpantallas compartidas
import { ProjectDetailScreen } from "../../app/views/shared/ProjectDetailScreen";
import { AddEditMaterialScreen } from "../../app/views/inventory/AddEditMaterialScreen";
import { CreateProjectScreen } from "../../app/views/profile/CreateProjectScreen";
import { EditProfileScreen } from "../../app/views/profile/EditProfileScreen";
import { ShoppingListScreen } from "../../app/views/saved/ShoppingListScreen";
import { RealizandoProyectoScreen } from "../../app/views/shared/RealizandoProyectoScreen";
import { CompletarProyectoScreen } from "../../app/views/shared/CompletarProyectoScreen";

// Tipos de navegación para cada stack interno
export type HomeStackParamList = {
  HomeMain: undefined;
  ProjectDetail: { idProyecto: string };
  RealizandoProyecto: { idProyecto: string };
  CompletarProyecto: undefined;
};

export type ExploreStackParamList = {
  ExploreMain: undefined;
  ProjectDetail: { idProyecto: string };
  RealizandoProyecto: { idProyecto: string };
  CompletarProyecto: undefined;
};

export type InventoryStackParamList = {
  InventoryMain: undefined;
  AddEditMaterial: { idEditar?: string };
};

export type SavedStackParamList = {
  SavedMain: undefined;
  ShoppingList: undefined;
  ProjectDetail: { idProyecto: string };
  RealizandoProyecto: { idProyecto: string };
  CompletarProyecto: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  CreateProject: { idEditar?: string } | undefined;
  ProjectDetail: { idProyecto: string };
  RealizandoProyecto: { idProyecto: string };
  CompletarProyecto: undefined;
};

// Stacks internos para cada tab
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HomeStackScreen: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <HomeStack.Screen name="RealizandoProyecto" component={RealizandoProyectoScreen} />
    <HomeStack.Screen name="CompletarProyecto" component={CompletarProyectoScreen} />
  </HomeStack.Navigator>
);

const ExploreStackScreen: React.FC = () => (
  <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
    <ExploreStack.Screen name="ExploreMain" component={ExploreScreen} />
    <ExploreStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <ExploreStack.Screen name="RealizandoProyecto" component={RealizandoProyectoScreen} />
    <ExploreStack.Screen name="CompletarProyecto" component={CompletarProyectoScreen} />
  </ExploreStack.Navigator>
);

const InventoryStackScreen: React.FC = () => (
  <InventoryStack.Navigator screenOptions={{ headerShown: false }}>
    <InventoryStack.Screen name="InventoryMain" component={InventoryScreen} />
    <InventoryStack.Screen name="AddEditMaterial" component={AddEditMaterialScreen} />
  </InventoryStack.Navigator>
);

const SavedStackScreen: React.FC = () => (
  <SavedStack.Navigator screenOptions={{ headerShown: false }}>
    <SavedStack.Screen name="SavedMain" component={SavedScreen} />
    <SavedStack.Screen name="ShoppingList" component={ShoppingListScreen} />
    <SavedStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <SavedStack.Screen name="RealizandoProyecto" component={RealizandoProyectoScreen} />
    <SavedStack.Screen name="CompletarProyecto" component={CompletarProyectoScreen} />
  </SavedStack.Navigator>
);

const ProfileStackScreen: React.FC = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="CreateProject" component={CreateProjectScreen} />
    <ProfileStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <ProfileStack.Screen name="RealizandoProyecto" component={RealizandoProyectoScreen} />
    <ProfileStack.Screen name="CompletarProyecto" component={CompletarProyectoScreen} />
  </ProfileStack.Navigator>
);

const Tab = createBottomTabNavigator();

/**
 * Navegador principal con 5 tabs.
 * Cada tab contiene un stack interno para poder navegar a subpantallas
 * sin perder el tab bar.
 */
export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.borderLight,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={26} color={color} />,
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStackScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="search-outline" size={26} color={color} />,
        }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryStackScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={26} color={color} />,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStackScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={26} color={color} />,
        }}
        listeners={({ navigation }) => ({
          // Al pulsar la pestaña Guardados volvemos siempre a la lista de
          // favoritos, en lugar de quedarnos donde estuviera el stack
          // (p.ej. Lista de la compra). Más natural en una bottom-tab.
          tabPress: () => {
            navigation.navigate("SavedTab", { screen: "SavedMain" });
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
