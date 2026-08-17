const Tips = (sequelize, DataTypes) => {
  const Tips = sequelize.define(
    "Tips",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // ==========================================
      // MATCH INFORMATION
      // ==========================================

      league: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      time: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      match: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ==========================================
      // SOURCE
      // ==========================================

      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "manual",
      },

      // ==========================================
      // BETTING TIP
      // ==========================================

      market: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      prediction: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      odds: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },

      confidence: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      analysis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // ==========================================
      // TIP TYPE
      // free | bronze | silver | gold
      // ==========================================

      tipsType: {
        
        type: DataTypes.ENUM("free", "bronze", "silver", "gold"),
        allowNull: false,
        defaultValue: "free",
      },

      // ==========================================
      // FULL-TIME SCORE
      // ==========================================

      homeScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      awayScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // ==========================================
      // HALF-TIME SCORE
      // ==========================================

      halfTimeHomeScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      halfTimeAwayScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // ==========================================
      // CORNERS
      // ==========================================

      homeCorners: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      awayCorners: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // ==========================================
      // BOOKINGS / CARDS
      // ==========================================

      homeBookings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      awayBookings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // ==========================================
      // TIP RESULT
      //
      // Pending:
      // isWon = null
      // isLost = null
      // isRefunded = null
      //
      // Won:
      // isWon = true
      // isLost = false
      // isRefunded = false
      //
      // Lost:
      // isWon = false
      // isLost = true
      // isRefunded = false
      //
      // Refunded:
      // isWon = false
      // isLost = false
      // isRefunded = true
      // ==========================================

      isWon: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },

      isLost: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },

      isRefunded: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "Tips",
      timestamps: true,
    }
  );

  return Tips;
};

export default Tips;
