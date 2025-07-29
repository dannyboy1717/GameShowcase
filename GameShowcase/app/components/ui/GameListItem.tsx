import { Game } from "@/app/types/Game";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useNavigation, useRouter } from "expo-router";

interface GameListItemProps {
  game: Game;
}

export default function GameListItem(props: GameListItemProps) {
  const navigation = useNavigation<any>();
  const router = useRouter();

  function goToDetails(game: Game): void {
    //navigation.navigate("screens/GameDetailScreen", { id: game.id });
    router.push(`/screens/GameDetailScreen?id=${game.id}`);
  }

  return (
    <Pressable onPress={() => goToDetails(props.game)} className="min-h-12 justify-center" onFocus={() => router.prefetch(`/screens/GameDetailScreen?id=${props.game.id}`)}>
      <Text className="text-lg font-semibold">{props.game.Name}</Text>
      {props.game["Developer/Publisher"] && (
        <>
        <Text className="text-md">{props.game["Developer/Publisher"]}</Text>
        </>
      )}
    </Pressable>
  );
}