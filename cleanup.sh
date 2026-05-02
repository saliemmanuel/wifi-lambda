#!/bin/bash

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${RED}   ZAWIFI - SCRIPT DE NETTOYAGE COMPLET      ${NC}"
echo -e "${BLUE}==============================================${NC}"

echo -e "${RED}⚠️  AVERTISSEMENT : Cela va supprimer :${NC}"
echo -e " - Les containers (App, DB, Redis)"
echo -e " - Les volumes de données (Toutes vos bases de données)"
echo -e " - Les réseaux Docker du projet"
echo -e ""
echo -e "${RED}Note : Vos autres containers (n8n, traefik, etc.) ne seront PAS touchés.${NC}"
echo -e "${BLUE}----------------------------------------------${NC}"

read -p "Voulez-vous vraiment TOUT supprimer ? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "❌ ${RED}Nettoyage annulé.${NC}"
    exit 1
fi

echo -e "\n🧹 ${BLUE}Arrêt des services et suppression des volumes...${NC}"

# 1. Arrêt et suppression des containers et volumes du projet courant uniquement
docker compose down -v

if [ $? -eq 0 ]; then
    echo -e "\n✅ ${GREEN}Succès : Les containers et les données ont été supprimés.${NC}"
else
    echo -e "\n❌ ${RED}Erreur lors de la suppression des containers.${NC}"
fi

# 2. Nettoyage du cache de build pour éviter les vieux fichiers
echo -e "\n🧼 ${BLUE}Nettoyage du cache de build Docker...${NC}"
docker builder prune -f

echo -e "\n✨ ${GREEN}Le système est maintenant propre !${NC}"
echo -e "🚀 Pour tout réinstaller, lancez : ${GREEN}./deploy.sh${NC}"
echo -e "${BLUE}==============================================${NC}"
