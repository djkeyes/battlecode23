// automatically generated by the FlatBuffers compiler, do not modify

/**
 * Actions that can be performed.
 * Purely aesthetic; have no actual effect on simulation.
 * (Although the simulation may want to track the 'parents' of
 * particular robots.)
 * Actions may have 'targets', which are the units on which
 * the actions were performed.
 */
export enum Action{
  /**
   * Target: ID for direction in which attack occurs
   */
  LAUNCH_ATTACK = 0,

  /**
   * Target: ID for direction in which attack occurs
   */
  THROW_ATTACK = 1,

  /**
   * Target: ID of robot spawned
   */
  SPAWN_UNIT = 2,

  /**
   * Target: location mined, x + y * width
   */
  PICK_UP_RESOURCE = 3,

  /**
   * Target: location to place resource, x + y * width
   */
  PLACE_RESOURCE = 4,

  /**
   * Target: location destabilization is centralized at, x + y * width
   */
  DESTABILIZE = 5,

  /**
   * Target: location boost is centralized at, x + y * width
   */
  BOOST = 6,

  /**
   * Target: none
   */
  PICK_UP_ANCHOR = 7,

  /**
   * Target: location to place anchor, x + y * width
   */
  PLACE_ANCHOR = 8,

  /**
   * Target: change in health (can be negative)
   */
  CHANGE_HEALTH = 9,

  /**
   * Target: change in adamantium (can be negative)
   */
  CHANGE_ADAMANTIUM = 10,

  /**
   * Target: change in mana (can be negative)
   */
  CHANGE_MANA = 11,

  /**
   * Target: change in elixir (can be negative)
   */
  CHANGE_ELIXIR = 12,

  /**
   * Dies due to an uncaught exception
   * Target: none
   */
  DIE_EXCEPTION = 13
}

