const db = require("../db/connection.js");


exports.selectTopics = () => {
    return db 
    .query("SELECT * FROM topics;")
    .then(({rows}) => {
        return rows;
    });
};

exports.selectArticlesByID = (chosenArticle) => {
    return db 
    .query(`
        SELECT 
            a.author,
            a.title, 
            a.article_id, 
            a.body, 
            a.topic, 
            a.created_at, 
            a.votes, 
            a.article_img_url,
            COUNT(c.comment_id)::INT AS comment_count
        FROM 
            articles a
        LEFT JOIN 
            comments c ON a.article_id = c.article_id
        WHERE
            a.article_id = $1
        GROUP BY a.article_id`, [chosenArticle])

    .then(( {rows} ) => {
        return rows[0];
    });
};

exports.selectArticles = (sortByQuery, orderQuery, chosenTopic) => {
   
    let queryValues = []
    let queryStr = `
    
    SELECT 
        a.author,
        a.title,
        a.article_id,
        a.topic,
        a.created_at,
        a.votes,
        a.article_img_url,
        COALESCE(COUNT(c.comment_id), 0) :: int AS comment_count
    FROM 
        articles a
    LEFT JOIN 
        comments c ON a.article_id = c.article_id
    `;


    if (chosenTopic) { 
        queryValues.push(chosenTopic)
        queryStr += ` WHERE a.topic = $1`;
    }

    queryStr += ` GROUP BY a.article_id ORDER BY a.${sortByQuery} ${orderQuery};`

    return db
    .query(queryStr, queryValues)
    .then( ( {rows} ) => {
    return rows;
});
};

exports.selectCommentsByArticle = (chosenArticle) => {
    return db 
    .query(`SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC`, [chosenArticle])
    .then(( {rows} ) => {
        return rows;
    })
};

exports.insertCommentByArticle = (chosenArticle, userName, newComment) => {

    const values = [newComment, userName, chosenArticle]

    const queryStr = `INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING comment_id, body, author, article_id, votes, created_at;`

    return db 
    .query(queryStr, values)
    .then((postedComment) => {
        return(postedComment.rows)
    })
}

exports.updateArticlesByID = (chosenArticle, incVotes) => {

    const queryStr = `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING article_id, title, votes, author, body, topic, created_at`;

    const queryValues = [incVotes, chosenArticle]

    return db 
    .query(queryStr, queryValues)
    .then(( {rows} ) => {
        return rows[0];
    });
};

exports.deleteCommentByID = (chosenComment) => {

    return db 
    .query(`DELETE FROM comments WHERE comment_id = $1`, [chosenComment])
    .then((result) => {
        return result.rowCount;
    });
};

exports.selectUsers = () => {
    return db 
    .query("SELECT * FROM users;")
    .then(( {rows} ) => {
        return rows;
    });
};