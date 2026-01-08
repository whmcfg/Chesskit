import { useAtom, useAtomValue } from "jotai";
import { boardAtom, gameAtom } from "@/sections/analysis/states";
import { useEffect } from "react";
import { Chess } from "chess.js";

export const useAnalysisSync = () => {
  const [game, setGame] = useAtom(gameAtom);
  const board = useAtomValue(boardAtom);

  useEffect(() => {
    const boardHistory = board.history({ verbose: true });
    const gameHistory = game.history({ verbose: true });

    if (boardHistory.length === gameHistory.length + 1) {
      const isExtension = gameHistory.every(
        (m, i) => m.after === boardHistory[i].after
      );

      if (isExtension) {
        const newGame = new Chess();

        try {
          newGame.loadPgn(board.pgn());

          const originalHeaders = game.getHeaders();
          if (originalHeaders["SetUp"] === "1") {
            newGame.setHeader("SetUp", "1");
            newGame.setHeader("FEN", originalHeaders["FEN"]);
          }
        } catch {
          try {
            newGame.load(board.fen());
            newGame.setHeader("SetUp", "1");
            const startFen = game.getHeaders()["FEN"] || board.fen();
            newGame.setHeader("FEN", startFen);
          } catch (err) {
            console.error("Critical sync error", err);
            return;
          }
        }

        setGame(newGame);
      }
    }
  }, [board, game, setGame]);
};
