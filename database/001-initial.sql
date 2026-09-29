CREATE TABLE [Category] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(80) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Category] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Faq] (
    [Id] uniqueidentifier NOT NULL,
    [Question] nvarchar(max) NOT NULL,
    [Answer] nvarchar(max) NOT NULL,
    [Published] bit NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Faq] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [User] (
    [Id] uniqueidentifier NOT NULL,
    [Email] nvarchar(254) NOT NULL,
    [DisplayName] nvarchar(100) NOT NULL,
    [PasswordHash] nvarchar(512) NOT NULL,
    [Role] int NOT NULL,
    [EmailVerified] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [AvatarUrl] nvarchar(max) NULL,
    [Theme] nvarchar(max) NOT NULL,
    [FontSize] int NOT NULL,
    [FavoriteFandoms] nvarchar(max) NOT NULL,
    [LastActiveAt] datetimeoffset NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_User] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [AccountToken] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [TokenHash] nvarchar(64) NOT NULL,
    [Purpose] nvarchar(40) NOT NULL,
    [ExpiresAt] datetimeoffset NOT NULL,
    [Used] bit NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_AccountToken] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AccountToken_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [ChatMessage] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [ConversationId] uniqueidentifier NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [Response] nvarchar(max) NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_ChatMessage] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ChatMessage_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Content] (
    [Id] uniqueidentifier NOT NULL,
    [CategoryId] uniqueidentifier NOT NULL,
    [AuthorId] uniqueidentifier NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [Body] nvarchar(max) NOT NULL,
    [Type] int NOT NULL,
    [Status] int NOT NULL,
    [Fandom] nvarchar(100) NOT NULL,
    [Genre] nvarchar(100) NOT NULL,
    [Tags] nvarchar(max) NOT NULL,
    [ImageUrls] nvarchar(max) NOT NULL,
    [MediaUrl] nvarchar(max) NULL,
    [ReleaseDate] datetimeoffset NULL,
    [Featured] bit NOT NULL,
    [Views] bigint NOT NULL,
    [ModerationNote] nvarchar(max) NULL,
    [City] nvarchar(100) NULL,
    [Venue] nvarchar(max) NULL,
    [Latitude] float NULL,
    [Longitude] float NULL,
    [StartsAt] datetimeoffset NULL,
    [EndsAt] datetimeoffset NULL,
    [TicketUrl] nvarchar(max) NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Content] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Content_Category_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Category] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Content_User_AuthorId] FOREIGN KEY ([AuthorId]) REFERENCES [User] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Feedback] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Type] int NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [Status] int NOT NULL,
    [AdminReply] nvarchar(max) NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Feedback] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Feedback_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Session] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [TokenHash] nvarchar(64) NOT NULL,
    [ExpiresAt] datetimeoffset NOT NULL,
    [Revoked] bit NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Session] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Session_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [UserInterest] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [CategoryId] uniqueidentifier NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_UserInterest] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserInterest_Category_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Category] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UserInterest_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Activity] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Action] nvarchar(max) NOT NULL,
    [ContentId] uniqueidentifier NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Activity] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Activity_Content_ContentId] FOREIGN KEY ([ContentId]) REFERENCES [Content] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Activity_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Bookmark] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [ContentId] uniqueidentifier NOT NULL,
    [Note] nvarchar(max) NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Bookmark] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Bookmark_Content_ContentId] FOREIGN KEY ([ContentId]) REFERENCES [Content] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Bookmark_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Rating] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [ContentId] uniqueidentifier NOT NULL,
    [Stars] int NOT NULL,
    [Comment] nvarchar(max) NOT NULL,
    [CreatedAt] datetimeoffset NOT NULL,
    [Version] rowversion NOT NULL,
    CONSTRAINT [PK_Rating] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Rating_Stars] CHECK ([Stars] BETWEEN 1 AND 5),
    CONSTRAINT [FK_Rating_Content_ContentId] FOREIGN KEY ([ContentId]) REFERENCES [Content] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Rating_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([Id]) ON DELETE NO ACTION
);
GO


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Category]'))
    SET IDENTITY_INSERT [Category] ON;
INSERT INTO [Category] ([Id], [CreatedAt], [Description], [Name])
VALUES ('10000000-0000-0000-0000-000000000001', '2026-01-01T00:00:00.0000000+00:00', N'Anime fandom content', N'Anime'),
('10000000-0000-0000-0000-000000000002', '2026-01-01T00:00:00.0000000+00:00', N'Gaming fandom content', N'Gaming'),
('10000000-0000-0000-0000-000000000003', '2026-01-01T00:00:00.0000000+00:00', N'Movies fandom content', N'Movies'),
('10000000-0000-0000-0000-000000000004', '2026-01-01T00:00:00.0000000+00:00', N'TV Shows fandom content', N'TV Shows'),
('10000000-0000-0000-0000-000000000005', '2026-01-01T00:00:00.0000000+00:00', N'K-Pop fandom content', N'K-Pop'),
('10000000-0000-0000-0000-000000000006', '2026-01-01T00:00:00.0000000+00:00', N'Comics fandom content', N'Comics'),
('10000000-0000-0000-0000-000000000007', '2026-01-01T00:00:00.0000000+00:00', N'Manga fandom content', N'Manga'),
('10000000-0000-0000-0000-000000000008', '2026-01-01T00:00:00.0000000+00:00', N'Cosplay fandom content', N'Cosplay');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[Category]'))
    SET IDENTITY_INSERT [Category] OFF;
GO


CREATE UNIQUE INDEX [IX_AccountToken_TokenHash] ON [AccountToken] ([TokenHash]);
GO


CREATE INDEX [IX_AccountToken_UserId] ON [AccountToken] ([UserId]);
GO


CREATE INDEX [IX_Activity_ContentId] ON [Activity] ([ContentId]);
GO


CREATE INDEX [IX_Activity_UserId_CreatedAt] ON [Activity] ([UserId], [CreatedAt]);
GO


CREATE INDEX [IX_Bookmark_ContentId] ON [Bookmark] ([ContentId]);
GO


CREATE UNIQUE INDEX [IX_Bookmark_UserId_ContentId] ON [Bookmark] ([UserId], [ContentId]);
GO


CREATE UNIQUE INDEX [IX_Category_Name] ON [Category] ([Name]);
GO


CREATE INDEX [IX_ChatMessage_UserId_ConversationId_CreatedAt] ON [ChatMessage] ([UserId], [ConversationId], [CreatedAt]);
GO


CREATE INDEX [IX_Content_AuthorId] ON [Content] ([AuthorId]);
GO


CREATE INDEX [IX_Content_CategoryId] ON [Content] ([CategoryId]);
GO


CREATE INDEX [IX_Content_City_StartsAt] ON [Content] ([City], [StartsAt]);
GO


CREATE INDEX [IX_Content_ReleaseDate] ON [Content] ([ReleaseDate]);
GO


CREATE INDEX [IX_Content_Status_Type_CategoryId] ON [Content] ([Status], [Type], [CategoryId]);
GO


CREATE INDEX [IX_Feedback_Status] ON [Feedback] ([Status]);
GO


CREATE INDEX [IX_Feedback_UserId] ON [Feedback] ([UserId]);
GO


CREATE INDEX [IX_Rating_ContentId] ON [Rating] ([ContentId]);
GO


CREATE UNIQUE INDEX [IX_Rating_UserId_ContentId] ON [Rating] ([UserId], [ContentId]);
GO


CREATE UNIQUE INDEX [IX_Session_TokenHash] ON [Session] ([TokenHash]);
GO


CREATE INDEX [IX_Session_UserId] ON [Session] ([UserId]);
GO


CREATE UNIQUE INDEX [IX_User_Email] ON [User] ([Email]);
GO


CREATE INDEX [IX_UserInterest_CategoryId] ON [UserInterest] ([CategoryId]);
GO


CREATE UNIQUE INDEX [IX_UserInterest_UserId_CategoryId] ON [UserInterest] ([UserId], [CategoryId]);
GO


