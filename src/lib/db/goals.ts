import { getDB } from "@/lib/db";
import type { Goal, GoalType } from "@/types/goal";

export async function getGoal(id: string): Promise<Goal | undefined> {
  try {
    const db = await getDB();
    return await db.get("goals", id);
  } catch (error) {
    console.error("[goals] getGoal failed", error);
    return undefined;
  }
}

export async function putGoal(goal: Goal): Promise<void> {
  try {
    const db = await getDB();
    await db.put("goals", goal);
  } catch (error) {
    console.error("[goals] putGoal failed", error);
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("goals", id);
  } catch (error) {
    console.error("[goals] deleteGoal failed", error);
  }
}

export async function getGoalsByType(type: GoalType): Promise<Goal[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("goals", "by-type", type);
  } catch (error) {
    console.error("[goals] getGoalsByType failed", error);
    return [];
  }
}

export async function getAllGoals(): Promise<Goal[]> {
  try {
    const db = await getDB();
    return await db.getAll("goals");
  } catch (error) {
    console.error("[goals] getAllGoals failed", error);
    return [];
  }
}
